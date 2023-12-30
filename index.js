import fastify from "fastify"
import env from 'dotenv'
import db from './config/database.js'
import cloudinary from 'cloudinary'
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "fastify-multer"
//routes
import { usersRoutes } from './routes/users.js'
import { petsRoutes } from './routes/pets.js'
import { profilesRoutes } from "./routes/profiles.js"
import { healthCardsRoutes } from "./routes/healthCards.js"
import { careCardsRoutes } from "./routes/careCards.js"

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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'happy-tails-backend',
    allowedFormats: [ 'jpg', 'png' ],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
})

const parser = multer({ storage })

//initialize fastify
const app = fastify({
  logger: true
})
app.decorate('multer', { parser })

//Register routes
app.register(db, { uri })
app.register(profilesRoutes, { prefix: '/api/profiles' })
app.register(usersRoutes, { prefix: '/api' })
app.register(petsRoutes, { prefix: '/api/pets' })
app.register(healthCardsRoutes, { prefix: '/api/health-cards' })
app.register(careCardsRoutes, { prefix: '/api/care-cards' })

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


