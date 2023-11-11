import dotenv from 'dotenv'
import fastify from "fastify"
import mongoose from 'mongoose'


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

//set application listening on localhost
try {
  await app.listen({ port: Port })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

//handle root route
app.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})
