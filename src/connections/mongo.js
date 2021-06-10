import {MongoClient} from 'mongodb'
import {MONGO_DB, MONGO_URI} from '../config/env'

var db

export const connect = async () => {
    if (db) return db
    try {
        console.log('Connecting to mongo 📚')
        db = new MongoClient(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        if (!db.isConnected()) await db.connect()
        console.log('Connected to mongo 📍 : ', MONGO_URI)
        return db
    } catch (err) {
        if (db) {
            await db.close()
        }
        console.log('Error connecting to mongo')
        throw err
    }
}
