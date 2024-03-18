import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"
import { promises as fsPromises } from 'fs'
import tmp from 'tmp-promise'
import { v2 as cloudinary } from 'cloudinary'

async function index(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    .populate({ path: 'pets' })
    const pets = profile.pets
    reply.code(200).send(pets)
  } catch (error) {
    console.error(error)
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
    await pet.save()
    reply.code(201).send(pet)
  } catch (error) {
    console.error(error)
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
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deletePet(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    await pet.deleteOne()
    reply.code(200).send(pet._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    reply.code(200).send(pet)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addPhoto(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    const binaryData = req.file.buffer
    const url = await uploadImage(binaryData)
    pet.photo = url
    await pet.save()
    reply.code(200).send(url)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
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