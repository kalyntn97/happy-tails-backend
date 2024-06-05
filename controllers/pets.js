import { promises as fsPromises } from 'fs'
import tmp from 'tmp-promise'
import { v2 as cloudinary } from 'cloudinary'
//models
import { Profile } from "../models/profile.js"
import { Pet } from "../models/pet.js"
import { Illness } from "../models/illness.js"
import { createCareCard } from './careCards.js'
import { Medication } from '../models/medication.js'

async function index(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    .populate({ path: 'pets' })
    reply.code(200).send(profile.pets)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function create(req, reply) {
  try {
    req.body.parent = req.user.profile
    const pet = await Pet.create(req.body)
    await Profile.updateOne(
      { _id: req.user.profile },
      { $push: { pets: pet._id }},
    )
    reply.code(201).send(pet)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function update(req, reply) {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.petId,
      req.body.species === 'Others' ? { ...req.body, breed: null } : req.body,
      { new : true }
    )
    reply.code(200).send(pet)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deletePet(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    await pet.deleteOne()
    reply.code(200).send(pet._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function show(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    .populate([{ path: 'stats' }, { path: 'illnesses' }, { path: 'medications' }])
    reply.code(200).send(pet)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addPhoto(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    const binaryData = req.file.buffer
    const url = await uploadImage(binaryData)
    pet.photo = url
    await pet.save()
    reply.code(200).send(url)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function uploadImage(content) {
  try {
    //create a temp file
    const { path } = await tmp.file()
    await fsPromises.writeFile(path, content)

    //upload the temp file to Cloudinary
    const result = await cloudinary.uploader.upload(path, {
      folder: 'happy-tails',
      eager: [{ width: 400, height: 400, crop: 'crop', gravity: 'face' }],
    })

    console.log('Cloudinary upload result: ', result)

    return result.secure_url
  } catch (error) {
    console.error('Cloudinary error: ', error)
  }
}

async function addId(req, reply) {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.petId,
      { $push: { ids: req.body } },
      { new: true },
    )
    const newId = pet.ids[pet.ids.length - 1]
    reply.code(200).send(newId._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function updateId(req, reply) {
  try {
    const pet = await Pet.findById(req.params.petId)
    const id = pet.ids.id(req.params.idId)
    id = req.body
    await id.save()
    reply.code(200).send(id._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deleteId(req, reply) {
  try {
    await Pet.findByIdAndUpdate(
      req.params.petId,
      { $pull: { ids: { _id: req.params.idId } } },
      { new: true },
    )
    reply.code(200).send(req.params.idId)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addMed(req, reply) {
  try {
    const { name, dosage, refill, medReminder, refillReminder } = req.body

    if (medReminder | refillReminder) {
      const { amount, startDate: date, endDate, times, frequency } = dosage
      const careCardForm = { pets: [req.params.petId], repeat: true, date, ending: !!endDate, endDate, color: 0 }
    
      if (medReminder) {
        const medCareCardForm = { 
          ...careCardForm, times, frequency,
          name: 'med', medication: { name, amount },
        }
        const medCareCard = await createCareCard(medCareCardForm)
        dosage.reminder = medCareCard._id
      }

      if (refillReminder) {
        const { times, frequency } = refill
  
        const refillCareCardForm = { 
          ...careCardForm, times, frequency,
          name: 'refillMed', medication: { name },
        }
        const refillCareCard = await createCareCard(refillCareCardForm)
        refill.reminder = refillCareCard._id
      }
    }
    const newMed = await Medication.create(req.body)

    await Pet.findByIdAndUpdate(
      req.params.petId,
      { $push: { medications: newMed._id } },
      { new: true },
    )

    reply.code(200).send(newMed._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deleteMed(req, reply) {
  try {
    const medication = await Medication.findById(req.params.medId)
    await medication.deleteOne()
  
    reply.code(200).send(req.params.medId)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addService(req, reply) {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.petId,
      { $push: { services: req.body } },
      { new: true },
    )
    const newService = pet.services[pet.services.length - 1]
    reply.code(200).send(newService._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deleteService(req, reply) {
  try {
    await Pet.findByIdAndUpdate(
      req.params.petId,
      { $pull: { services: { _id: req.params.serviceId } } },
      { new: true },
    )
    reply.code(200).send(req.params.serviceId)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function addIllness(req, reply) {
  try {
    const illness = await Illness.create(req.body)
    await Pet.findByIdAndUpdate(
      req.params.petId,
      { $push: { illnesses: illness._id } },
    )
    reply.code(200).send(illness._id)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

async function deleteIllness(req, reply) {
  try {
    await Pet.findByIdAndUpdate(
      req.params.petId,
      { $pull: { illnesses: req.params.illnessId } },
      { new: true },
    )
    reply.code(200).send(req.params.illnessId)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}

export { 
  index, create, update, deletePet as delete, show, addPhoto, uploadImage, addId, updateId, deleteId, addMed, deleteMed, addService, deleteService, addIllness, deleteIllness
}