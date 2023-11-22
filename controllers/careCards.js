import { CareCard } from "../models/careCard.js"
import { Pet } from "../models/pet.js"

async function create(req, reply) {
  try {
    const times = req.body.times
    const freq = req.body.frequency
    
    const currentYear = (new Date).getFullYear()
    const currentMonth = (new Date).getMonth() + 1
    
    req.body.trackers.push({
      name: freq == 'yearly' ? currentYear : currentMonth + '-' + currentYear, 
      total: '', done: '', skipped: '', left: ''
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

    const careCard = await CareCard.findByIdAndUpdate(
      {'_id': req.params.careCardId},
      req.body,
      { new: true }
    )
    const updatedTracker = careCard.trackers[careCard.trackers.length - 1]

    calTotal(times, freq, updatedTracker)
    
    await careCard.save()
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

function calTotal(times, freq, tracker) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth.getDay()) / 7)

  if (freq === 'daily') {
    times === '' ? tracker['total'] = daysInMonth : tracker['total'] = times*daysInMonth
  } else if (freq === 'weekly') {
    times === '' ? tracker['total'] = weeksInMonth : tracker['total'] = times*weeksInMonth
  } else if (freq === 'monthly') {
    times === '' ? tracker['total'] = 1 : tracker['total'] = times
  } else if (freq === 'yearly') {
    times === '' ? tracker['total'] = 1 : tracker['total'] = times
  }
}

export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
}