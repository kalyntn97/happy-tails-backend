import * as petsCtrl from '../controllers/pets.js'

const petsRoutes = async (app) => {
  app.get('/api/pets', petsCtrl.index)
  app.post('/api/pets', petsCtrl.create)
}

export default petsRoutes