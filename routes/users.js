import FastifyAuth from '@fastify/auth'
import * as authCtrl from '../controllers/auth.js'
import { verifyUsernameAndPassword, verifyJWT } from '../middleware/auth.js'

const usersRoutes = async (fastify, opts, done) => {
  fastify
    .decorate('asyncVerifyJWT', verifyJWT)
    .decorate('asyncVerifyUsernameAndPassword', verifyUsernameAndPassword)
    .register(FastifyAuth)
    .after(() => { 
      fastify.route({
        method: [ 'POST', 'HEAD' ],
        url: '/signup',
        logLevel: 'warn',
        handler: authCtrl.signup
      })
    // login route
      fastify.route({
        method: [ 'POST', 'HEAD' ],
        url: '/login',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyUsernameAndPassword ]),
        handler: authCtrl.login
      })
    // logout route
      fastify.route({
        method: [ 'POST', 'HEAD' ],
        url: '/logout',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyJWT ]),
        handler: authCtrl.logout
      })     
    //change password route
      fastify.put('/change-password', { preHandler: fastify.auth([ fastify.asyncVerifyJWT ]) }, authCtrl.changePassword)
    //change account route
      fastify.route({
        method: [ 'PUT', 'HEAD' ],
        url: '/update-account',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyJWT ]),
        handler: authCtrl.updateUser
      })  
    //delete user/profile route
      fastify.route({
      method: [ 'DELETE', 'HEAD' ],
      url: '/delete-account',
      logLevel: 'warn',
      preHandler: fastify.auth([ fastify.asyncVerifyUsernameAndPassword ]),
      handler: authCtrl.deleteUser
    })
  })
  done()
}
export { usersRoutes }