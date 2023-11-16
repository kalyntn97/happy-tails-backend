import { errWithCause } from "pino-std-serializers"
import { HealthCard } from "../models/healthCard.js"
import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"
import mongoose from "mongoose"

async function index(req, reply) {
  try {
    // array. method
    // const healthCards = await HealthCard.find().populate({ path: 'pet' })
    // const filteredHealthCards = healthCards.filter(card => card.pet.parent.equals(req.user.profile))
    // console.log(filteredHealthCards)
    // reply.code(200).send(filteredHealthCards)
    // mongoDB method
    const healthCards = await HealthCard.aggregate([
      { 
        $lookup: { from: 'pets', localField: 'pet', foreignField: '_id', as: 'pet' }
      }, { 
        $unwind: '$pet' 
      }, {
        $match: { 'pet.parent': req.user.profile }
      },
    ])
    reply.code(200).send(healthCards)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    const healthCard = await HealthCard.create(req.body)
    const pet = await Pet.findById(healthCard.pet)
    const newHealthCard = await HealthCard.findById(healthCard._id)
    .populate({ path: 'pet' })
    pet.healthCard = newHealthCard._id
    await pet.save()
    reply.code(200).send(newHealthCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    .populate({ path: 'pet'})
    reply.code(200).send(healthCard)    
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function addVetCard(req, reply) {
  try {
    const healthCard = await HealthCard.findByIdAndUpdate(
      req.params.healthCardId,
      {$push: {vetCards: req.body}},
      {new: true}
    )
    const newVetCard = healthCard.vetCards[healthCard.vetCards.length - 1]
    // maybe add pet info
    reply.code(201).send(newVetCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function deleteHealthCard(req, reply) {
  try {
    const healthCard = await HealthCard.findByIdAndDelete(req.params.healthCardId)
    reply.code(200).send(healthCard)
  } catch {
    console.log(error)
    reply.code(500).send(error)
  }
}

export {
  index,
  create,
  show,
  addVetCard,
  deleteHealthCard as delete,
}