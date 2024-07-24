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

    this.startTimers()
  }

  private startTimers = () => {
    const promises = this.jobs.map(async (job, index) => {
      return await this.handleJob(job, index)
    })

    Promise.all(promises).then(() => {
      this.fileAggr.prepareBackup()
    })
  }

  private handleJob = async (job: BackupJob, index: number) => {
    try {
      const con: DatabaseConnection = new DatabaseConnection(job.uri, job.dbName)
      console.log(`[${job.dbName}] Connection successful.`)
      console.log(`[${job.dbName}] Collections to export: ${job.collections.join(', ')}`)

      for (const col of job.collections) {
        const res = await this.exportCollection(con, job.dbName, col)

        this.fileAggr.saveObject(res, col, `[${index}] ${job.dbName}`)
      }
    } catch (err) {
      console.error(`[${job.dbName}] Connection failed.`, err)
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
      console.error(`[${dbName}] Failed to export ${col} collection.`, err)
    }
  }
}
