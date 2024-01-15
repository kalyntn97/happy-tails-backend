import fp from 'fastify-plugin'
import mongoose from 'mongoose'

const ConnectDB = async (fastify, options, done) => {
  try {
    const db = await mongoose.connect(options.uri)

    db.connection.on('connected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'connected')
    })

    db.connection.on('error', (err) => {
      fastify.log.error({ actor: 'MongoDB' }, `connection error: ${err.message}`)
    })
    
    db.connection.on('disconnected', () => {
      fastify.log.error({ actor: 'MongoDB' }, 'disconnected')
    })
    done()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    done(error)
  }
}

export default fp( ConnectDB)