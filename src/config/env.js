/* eslint-disable no-undef */
export const NODE_ENV = process.env.NODE_ENV || 'dev'
export const NODE_APP_URI = process.env.NODE_APP_URI || 'http://localhost:8080'
export const PORT = process.env.PORT || 8080
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rest'
export const MONGO_DB = process.env.MONGO_DB || 'rest'
export const CORS_REGX = process.env.CORS_REGX || 'localhost'
export const BODY_LIMIT = process.env.BODY_LIMIT || '100kb'
export const NODE_APP_NAME = process.env.NODE_APP_NAME || 'local'
