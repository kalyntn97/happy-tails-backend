import { Pet } from "../models/pet.js"
import { Stat } from "../models/stat.js"

async function create(req, reply) {
  try {
    const { petId, logs } = req.body
    const pet = await Pet.findById(petId)
    
    const logsToUpdate = pet.stats ? logs.filter(log => pet.stats.some(stat => stat.name = log.name)) : []
    const logsToCreate = pet.stats ? logs.filter(log => !pet.stats.some(stat => stat.name = log.name)) : logs

    let logPromises = []
    let logsProcessed = []
    if (logsToCreate.length > 0) {
      logPromises.push(...logsToCreate.map(log => createStat(log, pet)))
    }
    if (logsToUpdate.length > 0) {
      logPromises.push(...logsToUpdate.map(log => updateStat(log, pet)))
    }
    logsProcessed = await Promise.all(logPromises)

    reply.code(200).send(logsProcessed)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function createStat(log, pet) {
  const { value, notes } = log
  const record = { value, notes }
  const stat = await Stat.create({ ...log, pet: pet._id, records: [record] })
  await Pet.updateOne(
    { _id: pet._id },
    { $push: { stats: stat._id } },
  )
  return stat
}

async function updateStat(log, pet) {
  const { name, value, notes } = log
  const statToUpdate = pet.stats.filter(stat => stat.name === name)
  const stat = Stat.findByIdAndUpdate(
    statToUpdate._id,
    { $push: { records: { value, notes } } },
    { new: true },
  )
  return stat
}

async function index(req, reply) {
  try {
    const stats = Stat.aggregate([
      { $lookup: { from: 'pets', localField: 'pet', foreignField: '_id', as: 'pet' } }, 
      { $unwind: '$pet' }, 
      { $match: { 'pet.parent': req.user.profile } },
    ])
    reply.code(200).send(stats)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

export {
  create, index
}