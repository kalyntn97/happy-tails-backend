import fastify from "fastify"
import env from 'dotenv'
import db from './config/database.js'
//routes
import { usersRoutes } from './routes/users.js'
import { petsRoutes } from './routes/pets.js'
import { profilesRoutes } from "./routes/profiles.js"

env.config()
const uri = process.env.CONNECT_DB

if (!uri) {
  console.error('Error: MongoDB URI is not defined. Make sure CONNECT_DB environment variable is set.')
}

//initialize fastify
const app = fastify({
  logger: true
})

//Register routes
app.register(petsRoutes, { prefix: '/api/pets' })
app.register(db, { uri })
app.register(usersRoutes, { prefix: '/api' })
app.register(profilesRoutes, { prefix: '/api/profiles'})

//handle root route
app.get('/', async function handler (req, reply) {
  return { hello: 'world' }
})

//set application listening on localhost
const start = async () => {
  try {
    await app.listen({ port : process.env.PORT}) 
  } catch (error){
      app.log.error(error)
      process.exit(1)
  }
}

start()


