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

export {
  index,
  create,
}