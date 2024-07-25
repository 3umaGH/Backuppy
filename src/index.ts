import { DROPBOX_APP_CODE, DROPBOX_APP_KEY, DROPBOX_APP_SECRET, INTERVAL_HOURS, jobs, TEMP_PATH } from './config/config'
import { BackupAggregator } from './services/BackupAggregator'
import { FileAggregator } from './services/FileAggregator'
import { DropboxService } from './services/uploaders/DropboxService'

const dropboxService = new DropboxService(DROPBOX_APP_KEY, DROPBOX_APP_SECRET)
dropboxService.setTokens(DROPBOX_APP_CODE)

const fileAggregator = new FileAggregator(TEMP_PATH)
const backupAggregator = new BackupAggregator(jobs, INTERVAL_HOURS, fileAggregator, [dropboxService])
