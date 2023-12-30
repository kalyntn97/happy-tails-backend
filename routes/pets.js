import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as petsCtrl from '../controllers/pets.js'

const petsRoutes = async (fastify, opts, done) => {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .register(FastifyAuth)
    .after(() => {
      fastify.addHook('preHandler', fastify.auth([fastify.asyncVerifyJWT]))
    })
    fastify.get('/', petsCtrl.index)
    fastify.get('/:petId', petsCtrl.show)
    fastify.post('/', petsCtrl.create)
    fastify.post('/:petId/add-photo', { preHandler: fastify.multer.parser.single('upload') }, petsCtrl.addPhoto)
    fastify.put('/:petId', petsCtrl.update)
    fastify.delete('/:petId', petsCtrl.delete)
  done()
}

export { petsRoutes }