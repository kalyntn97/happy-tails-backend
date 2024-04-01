import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as profilesCtrl from '../controllers/profiles.js'

const profilesRoutes = async (fastify, opts, done )=> {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .register(FastifyAuth)
    .after(() => {
      fastify.addHook('preHandler', fastify.auth([fastify.asyncVerifyJWT]))
    })
    // profile route
    fastify.get('/', profilesCtrl.show)
    fastify.put('/update', profilesCtrl.update)
    fastify.patch('/add-photo', { preHandler: fastify.upload.single('file') }, profilesCtrl.addPhoto)
    fastify.patch('/add-banner', { preHandler: fastify.upload.single('file') }, profilesCtrl.addBanner)
    fastify.patch('/streak', profilesCtrl.updateStreak)
  
  done()
}

export { profilesRoutes }