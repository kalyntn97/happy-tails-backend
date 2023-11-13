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
  fastify.get('/:profileId', profilesCtrl.show)

  done()
}

export { profilesRoutes }