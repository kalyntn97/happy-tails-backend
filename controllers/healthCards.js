import { HealthCard } from "../models/healthCard.js"
import { getCurrentDate } from "./helper.js"

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
    console.error(error)
    reply.code(500).send(error)
  }
}

// async function create(req, reply) {
//   try {
//     const healthCard = await HealthCard.create(req.body)
//     const pet = await Pet.findById(healthCard.pet)
//     const newHealthCard = await HealthCard.findById(healthCard._id)
//     .populate({ path: 'pet' })
//     pet.healthCard = newHealthCard._id
//     await pet.save()
//     reply.code(200).send(newHealthCard)
//   } catch (error) {
//     console.error(error)
//     reply.code(500).send(error)
//   }
// }

async function show(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    .populate({ path: 'pet'})
    const vetCards = healthCard.vetCards
    reply.code(200).send(healthCard)    
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addVetCard(req, reply) {
  try {
    req.body.isVaccine = !!req.body.isVaccine
    const healthCard = await HealthCard.findByIdAndUpdate(
      req.params.healthCardId,
      {$push: {vetCards: req.body}},
      {new: true}
    )
    const newVetCard = healthCard.vetCards[healthCard.vetCards.length - 1]

    if (newVetCard.lastDone) {
      const freq = newVetCard.frequency
      const times = newVetCard.times
      const dueDate = new Date(newVetCard.lastDone)
      
      calDueDate(freq, times, dueDate)

      newVetCard.nextDue = dueDate
    } else {
      newVetCard.nextDue = new Date()
    }
    // maybe add pet info
    await newVetCard.save()
    reply.code(201).send(newVetCard)
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
// async function deleteHealthCard(req, reply) {
//   try {
//     const healthCard = await HealthCard.findByIdAndDelete(req.params.healthCardId)
//     reply.code(200).send(healthCard)
//   } catch {
//     console.error(error)
//     reply.code(500).send(error)
//   }
// }

async function deleteVetCard(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const vetCard = healthCard.vetCards.id(req.params.vetCardId)
    vetCard.deleteOne()
    await healthCard.save()
    reply.code(200).send(vetCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function updateVetCard(req, reply) {
  try {
    req.body.isVaccine = !!req.body.isVaccine
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const vetCard = healthCard.vetCards.id(req.params.vetCardId)
    vetCard.name = req.body.name
    vetCard.isVaccine = req.body.isVaccine
    vetCard.type = req.body.type
    vetCard.times = req.body.times
    vetCard.frequency = req.body.frequency
    vetCard.lastDone = req.body.lastDone

    const freq = vetCard.frequency
    const times = vetCard.times
    const dueDate = new Date(vetCard.lastDone)
    calDueDate(freq, times, dueDate)
    vetCard.nextDue = dueDate

    await healthCard.save()
    reply.code(200).send(vetCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const vetCard = healthCard.vetCards.id(req.params.vetCardId)
    
    vetCard.lastDone = req.body.lastDone
    const freq = vetCard.frequency
    const times = vetCard.times
    const dueDate = new Date(vetCard.lastDone)
    calDueDate(freq, times, dueDate)
    vetCard.nextDue = dueDate

    await healthCard.save()
    reply.code(200).send(vetCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

export {
  index,
  // create,
  show,
  addVetCard,
  // deleteHealthCard as delete,
  deleteVetCard,
  updateVetCard,
  checkDone,
}