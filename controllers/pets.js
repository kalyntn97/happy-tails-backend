import { Pet } from "../models/pet.js"

async function index(req, res) {
  try {
    const pets = await Pet.find()
    res.status(200).send(pets)
  } catch (error) {
    res.status(500).send(error)
  }
}

async function create(req, res) {
  try {
    const pet = await Pet.create(req.body)
    res.status(201).send(pet)
  } catch (error) {
    res.status(500).send(error)
  }
}

async function update(req, res) {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.petId,
      req.body,
      { new : true }
    )
    res.status(200).send(pet)
  } catch (error) {
    res.status(500).send(error)
  }
}

async function deletePet(req, res) {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.petId)
    res.status(200).send(pet)
  } catch (error) {
    res.status(500).send(error)
  }
}

async function show(req, res) {
  try {
    const pet = await Pet.findById(req.params.petId)
    res.status(200).send(pet)
  } catch (error) {
    res.status(500).send(error)
  }
}

export {
  index,
  create,
  update,
  deletePet as delete,
  show,
}