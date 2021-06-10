import { connect }  from '../connections/mongo'

export default async (app, logger) => {
    const db = await connect()

    // add mongo and logger to req
    app.use((req, res, next) => {
        req.db = db
        req.log = logger
        next()
    })
}
