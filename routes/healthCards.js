import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as healthCardsCtrl from '../controllers/healthCards.js'

const healthCardsRoutes = async (fastify, opts, done) => {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .register(FastifyAuth)
    .after(() => {
      fastify.addHook('preHandler', fastify.auth([fastify.asyncVerifyJWT]))
    })   
    fastify.get('/', healthCardsCtrl.index)
    fastify.get('/:healthCardId', healthCardsCtrl.show)
    fastify.post('/', healthCardsCtrl.create)
    fastify.put('/:healthCardId', healthCardsCtrl.update)
    fastify.patch('/:healthCardId/check', healthCardsCtrl.checkDone),
    fastify.delete('/:healthCardId', healthCardsCtrl.delete),
  done()
}

export { healthCardsRoutes }