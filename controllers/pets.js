import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"
import { HealthCard } from "../models/healthCard.js"
import { promises as fsPromises } from 'fs'
import tmp from 'tmp-promise'
import { v2 as cloudinary } from 'cloudinary'

async function index(req, reply) {
  try {
    const pets = await Pet.find()
    reply.code(200).send(pets)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    req.body.parent = req.user.profile
    const pet = await Pet.create(req.body)
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { pets: pet }},
      { new: true }
    )
    pet.parent = profile
    const healthCard = await HealthCard.create({ 'pet': pet._id })
    pet.healthCard = healthCard._id
    await pet.save()
    reply.code(201).send(pet)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function update(req, reply) {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.petId,
      req.body,
      { new : true }
    )
    reply.code(200).send(pet)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function deletePet(req, reply) {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.petId)
    await HealthCard.findByIdAndDelete(pet.healthCard)
    reply.code(200).send(pet)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    reply.code(200).send(pet)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function addPhoto(req, reply) {
  try {
    console.log('request', req)
    console.log('request file', req.file)
    const pet = await Pet.findById(req.params.petId)
    const binaryData = req.file.buffer
    const result = await uploadImage(binaryData)
    pet.photo = result
    await pet.save()
    reply.code(200).send({message: 'Success', url: result})
  } catch (error) {
    console.log(error)
    reply.code(500).send({message: 'Upload failed', error: error})
  }
}

async function uploadImage(content) {
  try {
    //create a temp file
    const { path } = await tmp.file()
    await fsPromises.writeFile(path, content)

    //upload the temp file to Cloudinary
    const result = await cloudinary.uploader.upload(path, {
      folder: 'happy-tails',
      eager: [{ width: 400, height: 400, crop: 'crop', gravity: 'face' }],
    })

    console.log('Cloudinary upload result: ', result)

    return result.secure_url
  } catch (error) {
    console.error('Cloudinary error: ', error)
    throw error
  }
}


export {
  index,
  create,
  update,
  deletePet as delete,
  show,
  addPhoto,
  uploadImage,
}