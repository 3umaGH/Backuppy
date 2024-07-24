import { Collection } from 'mongodb'
import { DatabaseConnection } from '../database/DatabaseConnection'
import { BackupJob } from '../types/types'
import { FileAggregator } from './FileAggregator'
import { uploadToDropbox } from '../util'

export class BackupAggregator {
  private jobs: BackupJob[]
  private hours_interval: number
  private fileAggr: FileAggregator

  constructor(jobs: BackupJob[], hoursInterval: number, fileAggr: FileAggregator) {
    this.jobs = jobs
    this.hours_interval = hoursInterval
    this.fileAggr = fileAggr

    try {
      this.startTimer()
    } catch (err) {
      console.error(`Failed to initalize timer.`, err)
    }
  }

  private startTimer = async () => {
    console.log(`Started backup loop. Interval: ${this.hours_interval} hours.`)

    // Initial backup on startup
    await this.handleJobs()

    setInterval(
      async () => {
        await this.handleJobs()
      },
      this.hours_interval * 60 * 60 * 1000
    )
  }

  private handleJobs = async () => {
    const promises = this.jobs.map(async (job, index) => {
      try {
        return await this.handleJob(job, index)
      } catch (err) {
        console.error(`Failed to complete a backup job. ${err}`)
      }
    })

    try {
      await Promise.all(promises)
      const archivePath = await this.fileAggr.prepareBackup()
      await uploadToDropbox(archivePath)

      console.log(`[${new Date().toLocaleString()}] Successfully uploaded ${archivePath} to Dropbox.`)
    } catch (err) {
      console.error(err)
    } finally {
      this.fileAggr.cleanUp()
    }
  }

  private handleJob = async (job: BackupJob, index: number) => {
    try {
      const con: DatabaseConnection = new DatabaseConnection(job.uri, job.dbName)

      try {
        await con.connect()
        console.log(`[${job.dbName}] Connected. Collections to export: [${job.collections.join(', ')}]`)
      } catch (err) {
        throw err
      }

      for (const col of job.collections) {
        try {
          const res = await this.exportCollection(con, job.dbName, col)

          this.fileAggr.saveObject(res, col, `[${index}] ${job.dbName}`)
        } catch (err) {
          throw err
        }
      }
    } catch (err) {
      throw new Error(`[${job.dbName}] Connection failed. ${err}`)
    }
  }

  private exportCollection = async (con: DatabaseConnection, dbName: string, col: string) => {
    try {
      const collection: Collection = con.getDb().collection(col)
      const cursor = collection.find({})
      const results = await cursor.toArray()

      console.log(`[${dbName}] Exported ${results.length} documents from ${col}.`)
      return results
    } catch (err) {
      throw new Error(`Failed to export ${col} collection. ${err}`)
    }
  }
}
