import { Collection } from 'mongodb'
import { DatabaseConnection } from '../database/DatabaseConnection'
import { BackupJob } from '../types/types'
import { FileAggregator } from './FileAggregator'

export class BackupAggregator {
  private jobs: BackupJob[]
  private fileAggr: FileAggregator

  constructor(jobs: BackupJob[], fileAggr: FileAggregator) {
    this.jobs = jobs
    this.fileAggr = fileAggr

    try {
      this.startTimer()
    } catch (err) {
      console.error(`Failed to initalize timer.`, err)
    }
  }

  private startTimer = async () => {
    const promises = this.jobs.map(async (job, index) => {
      try {
        return await this.handleJob(job, index)
      } catch (err) {
        console.error(`Failed to complete a backup job. ${err}`)
      }
    })

    await Promise.all(promises)
    await this.fileAggr.prepareBackup()
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
