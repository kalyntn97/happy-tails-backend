import { User } from "../models/user.js"
import { Profile } from '../models/profile.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
    const token = await newUser.generateToken()

    reply.code(201).send({ status: 'Account successfully created!', token })
  } catch (error) {
    console.error(error)
    try {
      if (req.body.profile) {
        await Profile.findByIdAndDelete(req.body.profile)
      }
    } catch (error) {
      console.error(error)
      return reply.code(500).send(error)
    }
    reply.code(500).send(error)
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
    if (!req.user) {
      throw new Error('Unable to change password. Authentication failed!')
    }
    if (req.user.username !== req.body.username) {
      throw new Error('Unable to confirm username.')
    }
    req.user.password = req.body.newPassword

    await req.user.save()
 
    reply.send({ status: 'Your password has been changed' })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function changeUsername(req, reply) {
  try {
    if (!req.user) {
      throw new Error('Unable to update account. Authentication failed!')
    }
    const isMatch = await req.user.comparePasswords(req.body.password)
    if (!isMatch) {
      throw new Error('Unable to confirm password')
    }
    req.user.username = req.body.newUsername

    await req.user.save()
    reply.send({ status: 'Your account has been changed', user: req.user })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}

export async function deleteUser(req, reply) {
  try {
    if (!req.user) {
      throw new Error ('Authentication failed!')
    }
    const deletedUser = req.user
    //delete user
    await req.user.deleteOne()
    reply.send({ status: 'Your account has been deleted!' })
  } catch (error) {
    console.error(error)
    reply.status(500).send(error)
  }
}