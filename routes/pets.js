import FastifyAuth from '@fastify/auth'
import { verifyJWT } from '../middleware/auth.js'
import * as petsCtrl from '../controllers/pets.js'
import * as statsCtrl from '../controllers/stats.js'

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
    fastify.patch('/:petId/add-photo', { preHandler: fastify.upload.single('file') }, petsCtrl.addPhoto)
    fastify.patch('/:petId/ids', petsCtrl.addId)
    fastify.patch('/:petId/medications', petsCtrl.addMed)
    fastify.patch('/:petId/services', petsCtrl.addService)
    fastify.patch('/:petId/illnesses', petsCtrl.addIllness)
    fastify.patch('/:petId/ids/:idId', petsCtrl.updateId)
    fastify.delete('/:petId/ids/:idId', petsCtrl.deleteId)
    fastify.delete('/:petId/medications/:medId', petsCtrl.deleteMed)
    fastify.delete('/:petId/services/:serviceId', petsCtrl.deleteService)
    fastify.delete('/:petId/illnesses/:illnessId', petsCtrl.deleteIllness)
    fastify.put('/:petId', petsCtrl.update)
    fastify.delete('/:petId', petsCtrl.delete)
  done()
}

export { petsRoutes }