import { User } from "../models/user.js"
import { Profile } from '../models/profile.js'
import jwt from 'jsonwebtoken'

export async function signup(req, reply) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('no SECRET in back-end .env')
    }
    if (!process.env.CLOUD_NAME) {
      throw new Error('no CLOUDINARY_URL in back-end .env file')
    }

    const user = await User.findOne({ username: req.body.username })
    if (user) throw new Error('Account already exists')

    const newProfile = await Profile.create(req.body)
    req.body.profile = newProfile._id

    const newUser = await User.create(req.body)
    await newUser.generateToken()

    reply.code(201).send({ newUser })
  } catch (error) {
    console.error(error)
    try {
      if (req.body.profile) {
        await Profile.findByIdAndDelete(req.body.profile)
      }
    } catch (error) {
      console.error(error)
      return reply.code(500).send({ error: error.message })
    }
    reply.code(500).send({ error: error.message })
  }
}

export async function login(req, reply) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('no SECRET in back-end .env')
    }
    if (!process.env.CLOUD_NAME) {
      throw new Error('no CLOUDINARY_URL in back-end .env file')
    }
    if (!req.user) {
      throw new Error ('Unable to login. Authentication failed!')
    }
    const token = await req.user.generateToken()
    reply.send({ status: 'You are logged in', token })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function logout(req, reply) {
  try {
    if (!req.user) {
      throw new Error('Unable to logout. Authentication failed!')
    }
    req.user.token = ''
    await req.user.save()
    reply.send({ status: 'You are logged out!' })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function changePassword(req, reply) {
  try {
    req.user.password = req.body.password

    await req.user.save()

    const token = createJWT(req.user)
    
    reply.send({ status: 'Your password has been changed', token: token })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function updateUser(req, reply) {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (!user) throw new Error('User not found')

    user.username = req.body.newUsername
    user.password = req.body.newPassword

    await user.save()
    reply.send({ status: 'Your account has been changed', user: req.user })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function deleteUser(req, reply) {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (!user) throw new Error('User not found')

    if (req.body.password !== req.user.password) {
      throw new Error('Wrong password entered. Please try again')
    }

    //delete profile
    try {
      const profile = await Profile.findById(req.user.profile)
      await profile.deleteOne()
    } catch (error) {
      console.log(`Error occurred while deleting profile: ${error}`)
    }
    
    //logout ?
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    //delete user
    const deletedUser = await user.deleteOne()
    reply.send({ status: 'Your account has been deleted!', user: deletedUser })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

function createJWT(user) {
  return jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '72h' })
}