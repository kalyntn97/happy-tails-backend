import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"
import { HealthCard } from "../models/healthCard.js"

async function index(req, reply) {
  try {
    console.log('user profile', req.user, req.user.profile)

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
    console.log('req.body.parent', req.body.parent)
    console.log('req.user.profile', req.user.profile)
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
    const pet = await Pet.findById(req.params.petId)
    pet.photo = req.file.path
    await pet.save()
    reply.code(200).send(pet)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

export {
  index,
  create,
  update,
  deletePet as delete,
  show,
  addPhoto
}