import { CareCard } from "../models/careCard.js"
import { Pet } from "../models/pet.js"

async function create(req, reply) {
  try {
    const times = req.body.times
    const freq = req.body.frequency

    req.body.trackers.push({
      name: currentMonth + '-' + currentYear, total: '', done: '', skipped: '', left: ''
    })
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    
    calTotal(times, freq, newTracker)
    
    const careCard = await CareCard.create(req.body)
    // const pet = await Pet.findById(careCard.pet)
    // const newCareCard = await CareCard.findById(careCard._id)
    // .populate({ path: 'pet' })
    // pet.careCards.push(newCareCard._id)
    // await pet.save()
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function deleteCareCard(req, reply) {
  try {
    const careCard = await CareCard.findByIdAndDelete(req.params.careCardId)
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function update(req, reply) {
  try {
    const times = req.body.times
    const freq = req.body.frequency

    const careCard = await CareCard.findById(req.params.careCardId)
    const newTracker = careCard.trackers[careCard.trackers.length - 1]
    
    calTotal(times, freq, newTracker)

    await CareCard.updateOne(
      req.body.careCardId,
      req.body,
      { new: true }
    )
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function index(req, reply) {
  try {
    const careCards = await CareCard.find()
    .populate({ path: 'pet' })
    reply.code(200).send(careCards)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    .populate({ path: 'pet' })

    const currentMonth = (new Date).getMonth() + 1
    const latestTracker = careCard.trackers[careCard.trackers.length - 1]
    const latestMonth = latestTracker["name"].slice(0, 2)

    if (currentMonth > latestMonth) {
      careCard.trackers.push({
        name: currentMonth + '-' + currentYear, 
        total: latestTracker["total"], 
        done: '', skipped: '', left: ''
      })
    }
    await careCard.save()
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

function getCurrentDate() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth.getDay()) / 7)
}

function calTotal(times, freq, newTracker) {
  getCurrentDate()

  if (freq === 'daily') {
    times === '' ? newTracker['total'] = daysInMonth : newTracker['total'] = times*daysInMonth
  } else if (freq === 'weekly') {
    times === '' ? newTracker['total'] = weeksInMonth : newTracker['total'] = times*weeksInMonth
  } else if (freq === 'monthly') {
    times === '' ? newTracker['total'] = 1 : newTracker['total'] = times
  } else if (freq === 'yearly') {
    times === '' ? newTracker['total'] = 1 : newTracker['total'] = times
  }
}

export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
}