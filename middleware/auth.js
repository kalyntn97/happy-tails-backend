import { User } from "../models/user.js"

export async function verifyUsernameAndPassword(req, reply) {
  try {
    if (!req.body) {
      throw new Error('Username and Password is required!')
    }
    const user = await User.findByCredentials(req.body.username, req.body.password)
    req.user = user
  } catch (error) {
    reply.code(400).send(error)
  }
}

export async function verifyJWT(req, reply) {
  try {
    if (!req.headers.authorization) {
      throw new Error('No token was sent')
    }
    const token = req.headers.authorization.replace('Bearer ', '')
    if (!token) {
      throw new Error('Token is missing')
    }
    const user = await User.findByToken(token)
    if (!user) {
      // handles logged out user with valid token
      throw new Error('Authentication failed!')
    }
    req.user = user
    req.token = token // used in logout route
    // console.log('req.user verify', req.user)
  } catch (error) {
    reply.code(401).send(error)
  }
}