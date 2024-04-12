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
    fastify.get('/', statsCtrl.index)
    // fastify.get('/:healthCardId', healthCardsCtrl.show)
    fastify.post('/', statsCtrl.create)
    // fastify.put('/:healthCardId', healthCardsCtrl.update)
    // fastify.patch('/:healthCardId/check', healthCardsCtrl.checkDone),
    // fastify.patch('/:healthCardId/:visitId/uncheck', healthCardsCtrl.uncheckDone),
    // fastify.patch('/:healthCardId/:visitId/add-notes', healthCardsCtrl.addVisitNotes),
    // fastify.delete('/:healthCardId', healthCardsCtrl.delete),
  done()
}

export { statsRoutes }