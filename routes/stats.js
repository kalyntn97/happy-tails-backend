import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as statsCtrl from '../controllers/stats.js'

const statsRoutes = async (fastify, opts, done) => {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .register(FastifyAuth)
    .after(() => {
      fastify.addHook('preHandler', fastify.auth([fastify.asyncVerifyJWT]))
    })
    fastify.post('/', statsCtrl.create)
  done()
}

export { statsRoutes }