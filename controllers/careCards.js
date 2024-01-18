import { CareCard } from "../models/careCard.js"
import { getCurrentDate } from "./helper.js"

async function create(req, reply) {
  try {
    const { currentYear, currentMonth, firstDay } = getCurrentDate()
    const { times, frequency } = req.body
    // create empty tracker
    req.body.trackers = []
    req.body.trackers.push({
      name: frequency === 'Yearly' || frequency === 'Monthly' ? currentYear : currentMonth + '-' + currentYear,
      done: [],
    })
    // set initial total and done values
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    newTracker.total = calTotal(times, frequency, newTracker)
    if (frequency === 'Yearly') {
      newTracker.done.push(0)
    } else {
      for (let i = 0; i < newTracker.total; i++) {
        newTracker.done.push(0)
      }  
      if (frequency === 'Daily') {
        newTracker.firstDay = firstDay
      }
    }

    const careCard = await CareCard.create(req.body)
    // const pet = await Pet.findById(careCard.pet)
    // const newCareCard = await CareCard.findById(careCard._id)
    // .populate({ path: 'pet' })
    // pet.careCards.push(newCareCard._id)
    // await pet.save()
    reply.code(201).send(careCard)
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
    console.log('data received', req.body)
    const { currentYear, currentMonth } = getCurrentDate()
    const { times, frequency } = req.body

    const careCard = await CareCard.findByIdAndUpdate(
      {'_id': req.params.careCardId},
      req.body,
      { new: true }
    )
    // get the latest tracker
    const updatedTracker = careCard.trackers[careCard.trackers.length - 1]
    // reset the tracker field
    updatedTracker.total = calTotal(times, frequency, updatedTracker)
    updatedTracker.done = []
    if (frequency === 'Yearly') {
      updatedTracker.done.push(0)
    } else {
      for (let i = 0; i < updatedTracker.total; i++) {
        updatedTracker.done.push(0)
      }
      if (frequency === 'Daily' && !updatedTracker.firstDay) {
        updatedTracker.firstDay = firstDay
      }
    }

    updatedTracker.name = frequency === 'Yearly' || frequency === 'Monthly' ? currentYear : `${currentMonth}-${currentYear}`

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
    const careCard = await CareCard.findById(req.params.careCardId)
    .populate({ path: 'pets' })
    
    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  const { daysPassed, weeksPassed } = getCurrentDate()
  console.log(`Days passed: ${daysPassed}, Weeks passed: ${weeksPassed}`)
  console.log('idx main func', req.body.index)
  const updateFunction = (tracker, frequency, index) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index]++
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0]++
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheck(req, reply) {
  const { daysPassed, weeksPassed } = getCurrentDate()
  const updateFunction = (tracker, frequency, index) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index]--
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0]--
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function updateTracker(req, reply, updateFunction) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    const tracker = careCard.trackers.id(req.params.trackerId)
    console.log('tracker found', tracker, 'freq', careCard.frequency, 'idx', req.body.index)
    const updatedTracker = updateFunction(tracker, careCard.frequency, req.body.index)
    console.log('updated tracker', updatedTracker)
    tracker.done = updatedTracker.done
    await careCard.save()
    reply.code(200).send(tracker)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

async function autoCreateTracker(req, reply) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)

    const { currentYear, currentMonth, firstDay } = getCurrentDate()
    const frequency = careCard.frequency
    const latestTracker = careCard.trackers[careCard.trackers.length - 1]

    //create new tracker
    const newTracker = {
      name: frequency === 'Yearly' || frequency === 'Monthly' ? currentYear : `${currentMonth}-${currentYear}`,
      total: latestTracker.total, //same tracker rollover
      done: []
    }
    if (frequency === 'Yearly') {
      newTracker.done.push(0)
    } else {
      for (let i = 0; i < newTracker.total; i++) {
        newTracker.done.push(0)
      }
      if (frequency === 'Daily' && !newTracker.firstDay) {
        newTracker.firstDay = firstDay
      }
    }
    careCard.trackers.push(newTracker)
    await careCard.save()

    reply.code(200).send(careCard)
  } catch (error) {
    console.log(error)
  }
}

function calTotal(times, freq, tracker) {
  const { daysInMonth, weeksInMonth } = getCurrentDate()
  if (freq === 'Daily') {
    tracker.total = daysInMonth
  } else if (freq === 'Weekly') {
    tracker.total = weeksInMonth
  } else if (freq === 'Monthly') {
    tracker.total = 12
  } else if (freq === 'Yearly') {
    tracker.total = times
  }
  return tracker.total
}

export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
  checkDone,
  uncheck,
  autoCreateTracker
}