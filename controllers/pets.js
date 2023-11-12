import { Pet } from "../models/pet.js"

async function index(req, reply) {
  try {
    const pets = await Pet.find()
    reply.code(200).send(pets)
  } catch (error) {
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    const pet = await Pet.create(req.body)
    reply.code(201).send(pet)
  } catch (error) {
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
    reply.code(500).send(error)
  }
}

async function deletePet(req, reply) {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.petId)
    reply.code(200).send(pet)
  } catch (error) {
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    reply.code(200).send(pet)
  } catch (error) {
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