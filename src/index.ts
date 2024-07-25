import { DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET, INTERVAL_HOURS, jobs, TEMP_PATH } from './config/config'
import { BackupAggregator } from './services/BackupAggregator'
import { FileAggregator } from './services/FileAggregator'
import { DropboxService } from './services/uploaders/DropboxService'

const dropboxService = new DropboxService(DROPBOX_APP_KEY, DROPBOX_APP_SECRET)
dropboxService.setTokens(DROPBOX_REFRESH_TOKEN)

const fileAggregator = new FileAggregator(TEMP_PATH)
const backupAggregator = new BackupAggregator(jobs, INTERVAL_HOURS, fileAggregator, [dropboxService])
