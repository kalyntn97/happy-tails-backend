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
    const profile = await Profile.findById(req.user.profile)
    .populate({ path: 'healthCards', populate: { path: 'pet' } })
    const healthCards = profile.healthCards
    reply.code(200).send(healthCards)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    const healthCard = await HealthCard.create(req.body)
    const { times, frequency, lastDone } = healthCard
    if (!healthCard.nextDue) {
      let nextDueDate
      if (!lastDone.length) {
        nextDueDate = new Date()
      } else {
        nextDueDate = lastDone[0].date
      }
      healthCard.nextDue = calDueDate(frequency, times, nextDueDate, 1)
    }
    await healthCard.save()
    const profile = await Profile.findById(req.user.profile)
    profile.healthCards.push(healthCard._id)
    await profile.save()
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
    const healthCard = await HealthCard.findByIdAndUpdate(
      req.params.healthCardId,
      req.body,
      { new: true },
    ).populate({ path: 'pet' })
    const { times, frequency, lastDone } = healthCard
    if (!healthCard.nextDue) {
      let nextDueDate
      if (!lastDone.length) {
        nextDueDate = new Date()
      } else {
        nextDueDate = lastDone[0].date
      }
      healthCard.nextDue = calDueDate(frequency, times, nextDueDate, 1)
    }
    await healthCard.save()
    reply.code(200).send(healthCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const { times, frequency, lastDone } = healthCard
    lastDone.unshift(req.body)
    healthCard.nextDue = calDueDate(frequency, times, new Date (req.body.date), 1)
    await healthCard.save()
    reply.code(200).send(healthCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function uncheckDone(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const { times, frequency, lastDone } = healthCard
    const visit = lastDone.id(req.params.visitId)
    if (visit._id === lastDone[0]._id) {
      //*when removing the last visit, calculate backward from the last visit if it is the only visit
      if (lastDone.length === 1) {
        healthCard.nextDue = calDueDate(frequency, times, new Date (lastDone[0].date), -1)
      } else {
        healthCard.nextDue = calDueDate(frequency, times, new Date (lastDone[1].date), 1)
      }
    } 
    lastDone.remove(visit)
    await healthCard.save()
    reply.code(200).send(visit._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addVisitNotes(req, reply) {
  try {
    const healthCard = await HealthCard.findById(req.params.healthCardId)
    const visit = healthCard.lastDone.id(req.params.visitId)
    visit.notes = req.body.notes
    await healthCard.save()
    reply.code(200).send(visit)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

function calDueDate(frequency, times, nextDueDate, direction) {
  //* calculate forward or backward based on direction value (1 or -1)
  switch (frequency) {
    case 'day(s)': nextDueDate.setDate(nextDueDate.getDate() + Number(times) * direction); break
    case 'week(s)': nextDueDate.setDate(nextDueDate.getDate() + Number(times) * 7 * direction); break
    case 'month(s)':
      const newMonth = nextDueDate.getMonth() + Number(times) * direction
      nextDueDate.setMonth(newMonth % 12) //handle month rollover
      nextDueDate.setFullYear(nextDueDate.getFullYear() + Math.floor(newMonth / 12) * direction) //handle year rollover
      break
    case 'year(s)': nextDueDate.setFullYear(nextDueDate.getFullYear() + Number(times) * direction); break
  }
  return nextDueDate
}

export {
  index,
  create,
  show,
  deleteHealthCard as delete,
  update,
  checkDone,
  uncheckDone,
  addVisitNotes,
}