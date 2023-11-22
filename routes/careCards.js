import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as careCardsCtrl from '../controllers/careCards.js'

const careCardsRoutes = async (fastify, opts, done) => {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .register(FastifyAuth)
    .after(() => {
      fastify.addHook('preHandler', fastify.auth([fastify.asyncVerifyJWT]))
    })     
    fastify.post('/', careCardsCtrl.create)
    fastify.put('/:careCardId', careCardsCtrl.update)
    fastify.delete('/:careCardId', careCardsCtrl.delete)
  done()
}

export { careCardsRoutes }