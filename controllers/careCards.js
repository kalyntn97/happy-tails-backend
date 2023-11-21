import { CareCard } from "../models/careCard.js"
import { Pet } from "../models/pet.js"

async function create(req, reply) {
  try {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

    const daysInMonth = lastDayOfMonth.getDate()
    const weeksInMonth = Math.ceil((daysInMonth + firstDayOfMonth.getDay()) / 7)
    
    const times = req.body.times
    const freq = req.body.frequency

    req.body.trackers.push({
      name: times + 'X ' + freq, total: '', done: '', skipped: '', left: ''
    })
    const newTracker = req.body.trackers[req.body.trackers.length - 1]
    
    if (freq === 'daily') {
      times === '' ? newTracker['total'] = daysInMonth : newTracker['total'] = times*daysInMonth
    } else if (freq === 'weekly') {
      times === '' ? newTracker['total'] = weeksInMonth : newTracker['total'] = times*weeksInMonth
    } else if (freq === 'monthly') {
      times === '' ? newTracker['total'] = 1 : newTracker['total'] = times
    }
    
    const careCard = await CareCard.create(req.body)
    const pet = await Pet.findById(careCard.pet)
    const newCareCard = await CareCard.findById(careCard._id)
    .populate({ path: 'pet' })
    pet.careCards.push(newCareCard._id)
    await pet.save()
    reply.code(200).send(newCareCard)
  } catch (error) {
    console.log(error)
    reply.code(500).send(error)
  }
}

export {
  create,
}