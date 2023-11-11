import * as petsCtrl from '../controllers/pets.js'

const petsRoutes = async (app, opts, done) => {
  app.get('/', petsCtrl.index)
  app.post('/', petsCtrl.create)
  app.put('/:petId', petsCtrl.update)
  done()
}

export default petsRoutes