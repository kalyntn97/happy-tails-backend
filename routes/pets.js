import * as petsCtrl from '../controllers/pets.js'

const petsRoutes = async (app, opts, done) => {
  app.get('/', petsCtrl.index)
  app.get('/:petId', petsCtrl.show)
  app.post('/', petsCtrl.create)
  app.put('/:petId', petsCtrl.update)
  app.delete('/:petId', petsCtrl.delete)

  done()
}

export default petsRoutes