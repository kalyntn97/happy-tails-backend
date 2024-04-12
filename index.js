import fastify from "fastify"
import multer from "fastify-multer"
import env from 'dotenv'
import db from './config/database.js'
import { v2 as cloudinary } from 'cloudinary'
//routes
import { usersRoutes } from './routes/users.js'
import { petsRoutes } from './routes/pets.js'
import { profilesRoutes } from "./routes/profiles.js"
import { healthCardsRoutes } from "./routes/healthCards.js"
import { careCardsRoutes } from "./routes/careCards.js"
import { statsRoutes } from "./routes/stats.js"

env.config()
const uri = process.env.CONNECT_DB

if (!uri) {
  console.error('Error: MongoDB URI is not defined. Make sure CONNECT_DB environment variable is set.')
}
//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//initialize fastify
const app = fastify({
  logger: true,
})
app.decorate('upload', upload)
//Register routes
app.register(multer.contentParser)
app.register(db, { uri })
app.register(profilesRoutes, { prefix: '/api/profile' })
app.register(usersRoutes, { prefix: '/api' })
app.register(petsRoutes, { prefix: '/api/pets' })
app.register(healthCardsRoutes, { prefix: '/api/health' })
app.register(careCardsRoutes, { prefix: '/api/care' })
app.register(statsRoutes, { prefix: '/api/stat' })

//handle root route
app.get('/', async function handler (req, reply) {
  return { hello: 'world' }
})

//set application listening on localhost
const start = () => {
  try {
    app.listen({ port : process.env.PORT}) 
  } catch (error){
    app.log.error(error)
    process.exit(1)
  }
}

start()
