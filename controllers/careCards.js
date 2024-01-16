import { CareCard } from "../models/careCard.js"
import { getCurrentDate } from "./helper.js"

async function create(req, reply) {
  try {
    const { currentYear, currentMonth } = getCurrentDate()
    const { times, frequency } = req.body
    // create empty tracker
    req.body.trackers = []
    req.body.trackers.push({
      name: frequency == 'Yearly' ? currentYear : currentMonth + '-' + currentYear,
      done: []
    })
    // set initial total and done values
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    newTracker.total = calTotal(times, frequency, newTracker)
    for (let i = 0; i < newTracker.total; i++) {
      newTracker.done.push(0)
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
    const { currentYear, currentMonth } = getCurrentDate()
    const { times, frequency } = req.body

    const careCard = await CareCard.findByIdAndUpdate(
      {'_id': req.params.careCardId},
      req.body,
      { new: true }
    )

    const updatedTracker = careCard.trackers[careCard.trackers.length - 1]
    updatedTracker.total = calTotal(times, frequency, updatedTracker)
    for (let i = 0; i < updatedTrackerTracker.total; i++) {
      newTracker.done.push(0)
    }  

    updatedTracker.name = frequency === 'Yearly' ? currentYear : `${currentMonth}-${currentYear}`

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
    // index is currentDate for Daily Tracker
    if (frequency === 'Daily') {
      tracker.done[index]++
    // index is currentWeek (weekPassed + 1, array index starts at 0)
    } else if (frequency === 'Weekly') {
      tracker.done[weeksPassed]++
    // Monthly and Yearly tracker only contain 1 count
    } else if (frequency === 'Monthly' || frequency === 'Yearly') {
      tracker.done[0]++
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheck(req, reply) {
  const { daysPassed, weeksPassed } = getCurrentDate()
  const updateFunction = (tracker, frequency, index) => {
    if (frequency === 'Daily') {
      tracker.done[index]--
    } else if (frequency === 'Weekly') {
      tracker.done[weeksPassed]--
    } else if (frequency === 'Monthly' || frequency === 'Yearly') {
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
    // check if a new tracker should be created for new month/ new year
    const newTracker = createNewTracker(careCard.frequency, careCard.trackers[careCard.trackers.length - 1])
    if (newTracker) {
      careCard.trackers.push(newTracker)
      await careCard.save()
      reply.code(200).send(careCard)
    } else {
      reply.code(200).send('Up to date. No new tracker created')
    }
  } catch (error) {
    console.log(error)
  }
}

function createNewTracker(frequency, latestTracker) {
  const { currentYear, currentMonth } = getCurrentDate()
  console.log(`LT year ${latestTracker.name.slice(-4)}, LT month ${latestTracker.name.split('-')[0]}`)
  // check if new month or new year
  const isNewYear = currentYear != latestTracker.name.slice(-4)
  const isNewMonth = currentMonth != latestTracker.name.split('-')[0]
  console.log(`isNewYear: ${isNewYear}, isNewMonth: ${isNewMonth}`)
  // create new tracker based on frequency
  if ((frequency === 'Yearly' && isNewYear) || (frequency !== 'Yearly' && isNewMonth)) {
    const newTracker = {
      name: frequency === 'Yearly' ? currentYear : `${currentMonth}-${currentYear}`,
      total: latestTracker.total,
      done: []
    }
    for (let i = 0; i < newTracker.total; i++) {
      newTracker.done.push(0)
    }
    return newTracker
  // no tracker created
  } else {
    return null
  }
}

function calTotal(times, freq, tracker) {
  const { daysInMonth, weeksInMonth } = getCurrentDate()
  if (freq === 'Daily') {
    tracker.total = daysInMonth
  } else if (freq === 'Weekly') {
    tracker.total = weeksInMonth
  } else if (freq === 'Monthly' || freq === 'Yearly') {
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