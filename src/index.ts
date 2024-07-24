import { BackupAggregator } from './services/BackupAggregator'
import { FileAggregator } from './services/FileAggregator'
import { BackupJob } from './types/types'

export const jobs: BackupJob[] = [
  {
    uri: '',
    dbName: 'Garaaz24',
    collections: ['listings', 'organizations'],
  },
  {
    uri: '/',
    dbName: 'Garaaz24',
    collections: ['users'],
  },
]

const fileAggregator = new FileAggregator('C:\\backuppy')
const backupAggregator = new BackupAggregator(jobs, fileAggregator)
