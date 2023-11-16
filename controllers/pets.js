import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"

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





export {
  index,
  create,
  update,
  deletePet as delete,
  show,
}