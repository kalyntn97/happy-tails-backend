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
    
    // profile route
      fastify.route({
        method: [ 'GET', 'HEAD' ],
        url: '/profile',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyJWT ]),
        handler: async (req, reply) => {
          reply.send({ status: 'Authenticated!', user: req.user })
        }
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
        method: [ 'POST', 'HEAD' ],
        url: '/change-password',
        logLevel: 'warn',
        preHandler: fastify.auth([ fastify.asyncVerifyUsernameAndPassword ]),
        handler: authCtrl.changePassword
      })     
    })
  done()
}
export { usersRoutes }