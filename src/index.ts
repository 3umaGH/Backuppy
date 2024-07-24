import { jobs } from './config/config'
import { BackupAggregator } from './services/BackupAggregator'
import { FileAggregator } from './services/FileAggregator'

const fileAggregator = new FileAggregator('C:\\backuppy')
const backupAggregator = new BackupAggregator(jobs, fileAggregator)
