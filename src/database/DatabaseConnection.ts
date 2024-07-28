import { Db, MongoClient } from 'mongodb'

export class DatabaseConnection {
  private db: Db
  private mongoClient: MongoClient

  constructor(uri: string, dbName: string) {
    this.mongoClient = new MongoClient(uri)
    this.db = this.mongoClient.db(dbName)
  }

  connect = () => {
    return this.mongoClient.connect()
  }

  close = () => {
    return this.mongoClient.close()
  }

  getDb = () => {
    return this.db
  }
}
