import { CareCard } from "../models/careCard.js"
import { getCurrentDate } from "./helper.js"

async function create(req, reply) {
  try {
    const { times, frequency } = req.body
    req.body.trackers = []
    const { currentYear, currentMonth, currentDate } = getCurrentDate()
   
    req.body.trackers.push({
      name: frequency == 'yearly' ? currentYear : currentMonth + '-' + currentYear, 
      done: []
    })
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    
    calTotal(times, frequency, newTracker)
    
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
    const { currentYear, currentMonth, currentDate } = getCurrentDate()
    const { times, frequency } = req.body

    const careCard = await CareCard.findByIdAndUpdate(
      {'_id': req.params.careCardId},
      req.body,
      { new: true }
    )

    const updatedTracker = careCard.trackers[careCard.trackers.length - 1]
    calTotal(times, frequency, updatedTracker)

    updatedTracker.name = frequency === 'yearly' ? currentYear : `${currentMonth}-${currentYear}`

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
    .populate({ path: 'pets' })
    reply.code(200).send(careCards)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const { currentDate, daysInMonth, weeksInMonth } = getCurrentDate()
    const careCard = await CareCard.findById(req.params.careCardId)
    .populate({ path: 'pets' })
    
    createNewTracker(careCard, careCard.trackers[careCard.trackers.length - 1])
    
    const latestTracker = careCard.trackers[careCard.trackers.length - 1]
    if (careCard.freq === 'daily' && latestTracker.done.length < currentDate) {
      const skipped = currentDate - latestTracker.done.length
      for (let i = 0; i < skipped; i++) {
        latestTracker.done.push(0)
      }
    }

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
    updateFunction(tracker, req.index)
    
    await careCard.save()
    reply.code(200).send(tracker)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  const updateFunction = (tracker, index) => {
    const count = tracker.done[index]
    tracker.done[index] = count++
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheck(req, reply) {
  const updateFunction = (tracker, index) => {
    const count = tracker.done[index]
    tracker.done[index] = count--
  }
  await updateTracker(req, reply, updateFunction)
}

function createNewTracker(careCard, latestTracker) {
  const { currentYear, currentMonth } = getCurrentDate()
  console.log(`LT year ${latestTracker.name.slice(-4)}, LT month ${latestTracker.name.split('-')[0]}`)

  const isNewYear = currentYear != latestTracker.name.slice(-4)
  const isNewMonth = currentMonth != latestTracker.name.split('-')[0]
  console.log(`isNewYear: ${isNewYear}, isNewMonth: ${isNewMonth}`)

  if ((careCard.freq === 'yearly' && isNewYear) || (careCard.freq !== 'yearly' && isNewMonth)) {
    careCard.trackers.push({
      name: careCard.freq === 'yearly' ? currentYear : `${currentMonth}-${currentYear}`,
      total: latestTracker.total,
      done: []
    })
  }
}

function calTotal(times, freq, tracker) {
  const { daysInMonth, weeksInMonth } = getCurrentDate()

  if (freq === 'daily') {
    tracker.total = daysInMonth
  } else if (freq === 'weekly') {
    tracker.total = weeksInMonth
  } else if (freq === 'monthly' || freq === 'yearly') {
    tracker.total = times
  }
}

export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
  checkDone,
  uncheck,
}