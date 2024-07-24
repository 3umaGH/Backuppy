import * as fs from 'fs'
import JSZip from 'jszip'
import { zipFolder } from '../util'

export class FileAggregator {
  private temp_path: string
  private last_archive_path: string | null

  constructor(backup_path: string) {
    this.temp_path = backup_path
    this.last_archive_path = null
  }

  saveObject = (obj: any, col: string, dbName: string) => {
    const ISODate = new Date().toISOString().replaceAll(':', '-')
    const dbPath = `${this.temp_path}\\result\\${dbName}`

    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true })
    }

    fs.writeFileSync(`${dbPath}\\[${ISODate}] ${col}.json`, JSON.stringify(obj, null, 2))
  }

  prepareBackup = async () => {
    const ISODate = new Date().toISOString().replaceAll(':', '-')
    const archivePath = `${this.temp_path}\\${ISODate}-bak.zip`

    await zipFolder(`${this.temp_path}\\result`, archivePath)
    this.last_archive_path = archivePath

    return archivePath
  }

  cleanUp = () => {
    try {
      fs.rmSync(`${this.temp_path}\\result\\`, { recursive: true })

      if (this.last_archive_path) {
        fs.rmSync(this.last_archive_path)
      }
    } catch (err) {
      console.error('Failed to clean up files.', err)
    }
  }
}
