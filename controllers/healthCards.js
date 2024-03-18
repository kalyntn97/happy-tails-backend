import { Pet } from "../models/pet.js"
import { HealthCard } from "../models/HealthCard.js"
import { Profile } from "../models/profile.js"

async function index(req, reply) {
  try {
    // mongoDB method
    // const healthCards = await HealthCard.aggregate([
    //   { 
    //     $lookup: { from: 'pets', localField: 'pet', foreignField: '_id', as: 'pet' }
    //   }, { 
    //     $unwind: '$pet' 
    //   }, {
    //     $match: { 'pet.parent': req.user.profile }
    //   },
    // ])
    const profile = await Profile(req.user.profile)
    .populate(
      { path: 'healthCards',
        populate: { path: 'pet' }
      }
    )
    const healthCards = profile.healthCards
    reply.code(200).send(healthCards)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    req.body.isVaccine = !!req.body.isVaccine
    const healthCard = await HealthCard.create(req.body)
    if (healthCard.lastDone && !healthCard.nextDue) {
      const freq = healthCard.frequency
      const times = healthCard.times
      const dueDate = new Date(healthCard.lastDone)
      
      calDueDate(freq, times, dueDate)

      healthCard.nextDue = dueDate
    } else if (!healthCard.lastDone) {
      healthCard.nextDue = new Date()
    }
    await HealthCard.save()
    const pet = await Pet.findById(healthCard.pet)
    pet.healthCards.push(healthCard._id)
    await pet.save()
    reply.code(200).send(healthCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    .populate({ path: 'pet'})
    reply.code(200).send(healthCard)    
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deleteHealthCard(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    await HealthCard.deleteOne()
    reply.code(200).send(healthCard)
  } catch {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function update(req, reply) {
  try {
    req.body.isVaccine = !!req.body.isVaccine
    const healthCard = await HealthCard.findByIdAndUpdate(
      req.params.healthCardId,
      req.body,
      { new: true }
    ).populate({ path: 'Pet' })

    if (healthCard.lastDone && !healthCard.nextDue) {
      const freq = healthCard.frequency
      const times = healthCard.times
      const dueDate = new Date(healthCard.lastDone)
      
      calDueDate(freq, times, dueDate)

      healthCard.nextDue = dueDate
    } else if (!healthCard.lastDone) {
      healthCard.nextDue = new Date()
    }
    await HealthCard.save()
    const pet = await Pet.findById(healthCard.pet)
    pet.healthCards.map(v => v._id === healthCard._id ? healthCard : v)
    await pet.save()

    reply.code(200).send(healthCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)

    healthCard.lastDone.push(req.body.done)
    if (!req.body.nextDue) {
      const freq = healthCard.frequency
      const times = healthCard.times
      const dueDate = new Date(healthCard.lastDone)
      calDueDate(freq, times, dueDate)
      healthCard.nextDue = dueDate
    }
    await HealthCard.save()
    reply.code(200).send(healthCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

function calDueDate(freq, times, dueDate) {
  const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  if (freq === 'monthly') {
    dueDate.setDate(dueDate.getDate() + Math.ceil(daysInMonth / times))
  } else if (freq === 'yearly') {
    dueDate.setMonth(dueDate.getMonth() + Math.ceil(12 / times))
  } else if (freq === 'years') {
    dueDate.setFullYear(dueDate.getFullYear() + times)
  }
}

export {
  index,
  create,
  show,
  deleteHealthCard as delete,
  update,
  checkDone,
}