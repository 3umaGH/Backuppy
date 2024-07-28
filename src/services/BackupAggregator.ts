import { Collection } from 'mongodb'
import { DatabaseConnection } from '../database/DatabaseConnection'
import { BackupJob, UploadService } from '../types/types'
import { FileAggregator } from './FileAggregator'

export class BackupAggregator {
  private readonly jobs: BackupJob[]
  private readonly hours_interval: number
  private readonly fileAggr: FileAggregator
  private readonly uploaders: UploadService[]

  constructor(jobs: BackupJob[], hoursInterval: number, fileAggr: FileAggregator, uploaders: UploadService[]) {
    this.jobs = jobs
    this.hours_interval = hoursInterval
    this.fileAggr = fileAggr
    this.uploaders = uploaders

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

      for (const uploader of this.uploaders) {
        try {
          const success = await uploader.upload(archivePath)

          if (success) {
            console.log(
              `[${new Date().toLocaleString()}] Successfully uploaded ${archivePath} to ${uploader.getName()}.`
            )
          }
        } catch (err) {
          console.error(`[${new Date().toLocaleString()}] Failed to upload backup to ${uploader.getName()}.`, err)
        }
      }
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

      con.close()
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
