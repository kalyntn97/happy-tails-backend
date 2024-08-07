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
    fastify.get('/', careCardsCtrl.index)     
    fastify.get('/:careCardId', careCardsCtrl.show)
    fastify.post('/', careCardsCtrl.create)
    fastify.put('/:careCardId', careCardsCtrl.update)
    fastify.patch('/:careCardId/:trackerId/check', careCardsCtrl.checkDone)
    fastify.patch('/:careCardId/:trackerId/uncheck', careCardsCtrl.uncheck)
    fastify.patch('/:careCardId/:trackerId/check-all', careCardsCtrl.checkAllDone)
    fastify.patch('/:careCardId/:trackerId/uncheck-all', careCardsCtrl.uncheckAll)
    fastify.delete('/:careCardId', careCardsCtrl.delete)
  done()
}

export { careCardsRoutes }