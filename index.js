import dotenv from 'dotenv'
import fastify from "fastify"
import mongoose from 'mongoose'
//routes
import petsRoutes from './routes/pets.js'

dotenv.config()

const Port = process.env.PORT
const uri = process.env.CONNECT_DB

//initialize fastify
const app = fastify({
  logger: true
})

//connect fastify to mongoose
try {
  mongoose.connect(uri);
} catch (e) {
  console.error(e);
}

//Register routes
app.register(petsRoutes, { prefix: '/api/pets' })

//handle root route
app.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

//set application listening on localhost
try {
  await app.listen({ port: Port })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}


