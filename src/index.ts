import { INTERVAL_HOURS, jobs, TEMP_PATH } from './config/config'
import { BackupAggregator } from './services/BackupAggregator'
import { FileAggregator } from './services/FileAggregator'

const fileAggregator = new FileAggregator(TEMP_PATH)
const backupAggregator = new BackupAggregator(jobs, INTERVAL_HOURS, fileAggregator)
