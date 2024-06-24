import { CareCard } from "../models/careCard.js"
import { Pet } from "../models/pet.js"
import { Profile } from "../models/profile.js"
import {compareMonthYear, getDateInfo } from "./helper.js"

async function create(req, reply) {
  try {
    const careCard = await createCareCard(req.body)
    reply.code(201).send(careCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

export const createCareCard = async (formData) => {
  const { repeat, date, frequency, times } = formData
  
  const { month: startMonth, year: startYear, firstDay } = getDateInfo(new Date(date))
  // create empty tracker
  let trackers = []
  if (repeat) {
    const total = calTotal(times, frequency, new Date())
    const trackerName = frequency === 'Yearly' || frequency === 'Monthly' ? startYear : `${startMonth}-${startYear}`
    const done = frequency === 'Yearly' ? Array(1).fill({ value: 0 }) : Array(total).fill({ value: 0 })
    const tracker = {
      name: trackerName,
      total: total,
      done: done,
      firstDay: frequency === 'Daily' ? firstDay : null,
    }
    trackers.push(tracker)
  } else {
    trackers.push({ name: 'no-repeat', done: Array(1).fill({ value: 0 })})
  }
  formData.trackers = trackers
  // create new CareCard and save to profile
  const careCard = await CareCard.create(formData)
  return careCard
}

async function deleteCareCard(req, reply) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    await careCard.deleteOne()
    reply.code(200).send(careCard._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
} 

async function update(req, reply) {
  try {
    const { repeat, date, frequency, times } = req.body
    const { month: startMonth, year: startYear, firstDay} = getDateInfo(new Date(date))
    let updatedTracker = null
    if (repeat) {
      const total = calTotal(times, frequency, date)
      updatedTracker = {
        name: frequency === 'Yearly' || frequency === 'Monthly' ? startYear : `${startMonth}-${startYear}`,
        total: total,
        done: frequency === 'Yearly' ? Array(1).fill({ value: 0 }) : Array(total).fill({ value: 0 }),
        firstDay: frequency === 'Daily' ? firstDay : null,
      }
    } else {
      endDate = null
      frequency = null
      times = null
      updatedTracker = { name: 'no-repeat', done: [{ value: 0 }], firstDay: null, total: null }
    }
    const careCard = await CareCard.findByIdAndUpdate(
      req.params.careCardId,
      req.body,
      { new: true }
    ).populate({ path: 'pets' })
    careCard.trackers.push(updatedTracker)
    await careCard.save()
    reply.code(200).send(careCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function index(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    const sortedCares = await verifyIndexUpdate(profile)

    reply.code(200).send(sortedCares)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

export async function verifyIndexUpdate(profile) {
  const careCards = await CareCard.aggregate([
    { $lookup: { from: 'pets', localField: 'pets', foreignField: '_id', as: 'petDetails' } },
    { $match: { $or: [
      { 'petDetails.admin': profile._id },
      { 'petDetails.editors': profile._id },
    ] } },
    { $addFields: {
      trackers: { $slice: ['$trackers', -1] },
      pets: { $map: {
        input: '$petDetails', as: 'pet', in: { _id: '$$pet._id', name: '$$pet.name', color: '$$pet.color', photo: '$$pet.photo', icon: '$$pet.icon' }
      } }
    } },
    { $project: { petDetails: 0 } }
  ])
  let sortedCares = sortByFrequency(careCards)
  //check if a new tracker should be created
  const today = new Date()
  let lastSavedDate = profile.streak.lastDate
  if (today.toDateString() !== lastSavedDate.toDateString()) {
    const { monthsPassed, yearsPassed, month, year } = compareMonthYear(today, lastSavedDate)
    if (monthsPassed !== 0 || yearsPassed !== 0) {
      const newTrackerNames = [`${month}-${year}`, `${year}`]
      const isUpdated = careCards.some(care => {
        return newTrackerNames.includes(care.trackers[care.trackers.length - 1].name)
      })
      if (!isUpdated) {
        sortedCares = await updateCareCards(sortedCares, monthPeriods, yearPeriods)
      }
    }
    lastSavedDate = today
    await profile.save()
  }
  return sortedCares
}

async function updateCareCards(sortedCares, monthPeriods, yearPeriods) {
  const careCardIds = [] // collect CareCard Ids that need new trackers
  //create trackers based on frequency, only repeating tasks
  if (monthPeriods) {
    ['Daily', 'Weekly'].forEach(frequency => 
      sortedCares[frequency] && sortedCares[frequency]
      .filter(care => !care.ending || (care.ending && new Date(care.endDate) > new Date())) //condition
      .forEach(care => careCardIds.push(care._id))
    )
  }
  if (yearPeriods) {
    ['Monthly', 'Yearly'].forEach(frequency =>
      sortedCares[frequency] && sortedCares[frequency]
      .filter(care => !care.ending || (care.ending && new Date(care.endDate) > new Date())) //condition
      .forEach(care => careCardIds.push(care._id))
    )
  }
  //batch create trackers for all CareCards
  const careCardsToProcess = await CareCard.find({ _id: { $in: careCardIds }, trackers: { $slice: 0 } })
    .populate({ path: 'pets', select: 'name color photo icon' })
  const trackerCreationPromises = careCardsToProcess.map(careCard => {
    const periods = ['Daily', 'Weekly'].includes(careCard.frequency) ? monthPeriods : yearPeriods
    return rollOverTracker(careCard, periods)
  })
  const updatedCareCards = await Promise.all(trackerCreationPromises)
  //update sorted CareCards with new trackers
  updatedCareCards.forEach(careCard => {
    const { frequency } = careCard
    const careIndex = sortedCares[frequency].findIndex(({ _id }) => _id.toString() === careCard._id.toString())
    sortedCares[frequency][careIndex] = careCard
  })
  return sortedCares
}

async function rollOverTracker(careCard, periods) {
  try {
    const { frequency, trackers } = careCard
    const { month, year, firstDay } = getDateInfo(new Date())
    //get the latest tracker to copy
    const latestTracker = trackers[trackers.length - 1]
    for (let i = 0; i < periods; i++) {
      const newTracker = {
        name: frequency === 'Yearly' || frequency === 'Monthly' ? year : `${month}-${year}`,
        total: latestTracker.total, //same tracker rollover
        done: []
      }
      if (frequency === 'Yearly') {
        newTracker.done.push(0)
      } else {
        for (let i = 0; i < newTracker.total; i++) {
          newTracker.done.push({ value: 0 })
        }
        if (frequency === 'Daily') {
          newTracker.firstDay = firstDay
        }
      }
      careCard.trackers.push(newTracker)
    }
    await careCard.save()
    return careCard
  } catch (error) {
    console.error(error)
  }
}

async function show(req, reply) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    .populate({ path: 'pets' })
    reply.code(200).send(careCard)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function checkDone(req, reply) {
  const updateFunction = (tracker, index, frequency) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index].value++
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0].value++
    } else {
      tracker.done[0].value++
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheck(req, reply) {
  const updateFunction = (tracker, index, frequency) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index].value--
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0].value--
    } else {
      tracker.done[0].value--
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function checkAllDone(req, reply) {
  const updateFunction = (tracker, index, frequency, times) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index].value = times 
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0].value = times
    } else {
      tracker.done[0].value = 1
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function uncheckAll(req, reply) {
  const updateFunction = (tracker, index, frequency) => {
    // index is current field
    if (frequency === 'Daily' || frequency === 'Weekly' || frequency === 'Monthly') {
      tracker.done[index].value = 0
    // Yearly tracker only contain 1 count
    } else if (frequency === 'Yearly') {
      tracker.done[0].value = 0
    } else {
      tracker.done[0].value = 0
    }
    return tracker
  }
  await updateTracker(req, reply, updateFunction)
}

async function updateTracker(req, reply, updateFunction) {
  try {
    const careCard = await CareCard.findById(req.params.careCardId)
    const tracker = careCard.trackers.id(req.params.trackerId)
    const updatedTracker = updateFunction(tracker, req.body.index, careCard.frequency, careCard.times)
    tracker.done = updatedTracker.done
    await careCard.save()
    reply.code(200).send(tracker)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

function calTotal(times, freq, date) {
  const { daysInMonth, weeksInMonth } = getDateInfo(new Date(date))
  const totalMap = {
    Daily: daysInMonth,
    Weekly: weeksInMonth,
    Monthly: 12,
    Yearly: times
  }
  return totalMap[freq]
}

export const sortByFrequency = (careArray) => {
  const sortOrder = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Others']
  const sorted = sortOrder.reduce((result, frequency) => {
    result[frequency] = []
    return result
  }, {})
  careArray.forEach(care => {
    const { frequency } = care
    const key = frequency || 'Others'
    sorted[key].push(care)
  })
  return sorted
}



export {
  create,
  deleteCareCard as delete,
  update,
  index,
  show,
  checkDone,
  uncheck,
  checkAllDone,
  uncheckAll,
}