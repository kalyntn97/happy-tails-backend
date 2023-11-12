import { fastify } from 'fastify'
import * as petsCtrl from '../controllers/pets.js'

const petsRoutes = async (fastify, opts, done) => {
  fastify.get('/', petsCtrl.index)
  fastify.get('/:petId', petsCtrl.show)
  fastify.post('/', petsCtrl.create)
  fastify.put('/:petId', petsCtrl.update)
  fastify.delete('/:petId', petsCtrl.delete)

  done()
}

export default petsRoutes