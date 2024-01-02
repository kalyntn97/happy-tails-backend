import { CareCard } from "../models/careCard.js"
import { getCurrentDate } from "./helper.js"

async function create(req, reply) {
  try {
    const { times, frequency } = req.body
    const { currentYear, currentMonth } = getCurrentDate()
   
    req.body.trackers.push({
      name: frequency == 'yearly' ? currentYear : currentMonth + '-' + currentYear, 
      done: 0, skipped: 0
    })
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    
    calTotal(times, frequency, newTracker)
    newTracker['left'] = newTracker['total']
    
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
    const { currentYear, currentMonth } = getCurrentDate()
    const { times, frequency } = req.body

    const careCard = await CareCard.findByIdAndUpdate(
      {'_id': req.params.careCardId},
      req.body,
      { new: true }
    )
    const updatedTracker = careCard.trackers[careCard.trackers.length - 1]
    calTotal(times, frequency, updatedTracker)

    updatedTracker['name'] = frequency === 'yearly' ? currentYear : `${currentMonth}-${currentYear}`
    updatedTracker['left'] = updatedTracker['total'] - updatedTracker['done'] - updatedTracker['skipped']

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
    const latestTracker = careCard.trackers[careCard.trackers.length - 1]

    createNewTracker(careCard, latestTracker)

    latestTracker['left'] = latestTracker['total'] - latestTracker['done'] - latestTracker['skipped']

    await careCard.save()
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function updateTracker(req, reply, updateFunction) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    const tracker = careCard.trackers.id(req.params.trackerId)

    updateFunction(tracker)
    tracker['left'] = tracker['total'] - tracker['done'] - tracker['skipped']

    await careCard.save()
    reply.code(200).send(tracker)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  const updateFunction = (tracker) => {
    tracker['done']++
  }
  await updateTracker(req, reply, updateFunction)
}

async function skip(req, reply) {
  const updateFunction = (tracker) => {
    tracker['skipped']++
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheck(req, reply) {
  const updateFunction = (tracker) => {
    tracker['done']--
  }
  await updateTracker(req, reply, updateFunction)
}

async function unskip(req, reply) {
  const updateFunction = (tracker) => {
    tracker['skipped']--
  }
  await updateTracker(req, reply, updateFunction)
}

function createNewTracker(careCard, latestTracker) {
  const { currentYear, currentMonth } = getCurrentDate()
  const isNewYear = currentYear != latestTracker['name'].slice(-4)
  const isNewMonth = currentMonth != latestTracker['name'].slice(0, 2)

  if ((careCard.freq === 'yearly' && isNewYear) || (careCard.freq !== 'yearly' && isNewMonth)) {
    careCard.trackers.push({
      name: careCard.freq === 'yearly' ? currentYear : `${currentMonth}-${currentYear}`,
      total: latestTracker['total'],
      done: 0, skipped: 0,
      left: latestTracker['total']
    })
  }
}

function calTotal(times, freq, tracker) {
  const { daysInMonth, weeksInMonth } = getCurrentDate()

  if (freq === 'daily') {
    tracker['total'] = times*daysInMonth
  } else if (freq === 'weekly') {
    tracker['total'] = times*weeksInMonth
  } else if (freq === 'monthly' || freq === 'yearly') {
    tracker['total'] = times
  }
}

export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
  checkDone,
  skip,
  uncheck,
  unskip,
}