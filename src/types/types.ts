export type BackupJob = { uri: string; dbName: string; collections: string[] }

export type UploadService = {
  getName: () => string
  upload: (path: string) => Promise<boolean>
}
