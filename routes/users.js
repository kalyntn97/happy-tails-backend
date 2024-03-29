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
      fastify.route({
        method: [ 'PATCH', 'HEAD' ],
        url: '/change-password',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyJWT ]),
        handler: authCtrl.changePassword
      })  
    //change account route
      fastify.route({
        method: [ 'PATCH', 'HEAD' ],
        url: '/change-username',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyJWT ]),
        handler: authCtrl.changeUsername
      })  
    //delete user/profile route
      fastify.route({
      method: [ 'POST', 'HEAD' ],
      url: '/delete-account',
      logLevel: 'warn',
      preHandler: fastify.auth([ fastify.asyncVerifyUsernameAndPassword ]),
      handler: authCtrl.deleteUser
    })
  })
  done()
}
export { usersRoutes }