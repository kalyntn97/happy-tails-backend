import fp from 'fastify-plugin'
import mongoose from 'mongoose'
import { User } from '../models/user.js'

const models = { User }

const ConnectDB = async (fastify, options) => {
  try {
    const db = await mongoose.connect(options.uri)

    db.connection.on('connected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'connected')
    })

    db.connection.on('disconnected', () => {
      fastify.log.error({ actor: 'MongoDB' }, 'disconnected')
    })

    // Decorate fastify with your models
    fastify.decorate('db', { models })
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

export default fp(ConnectDB)