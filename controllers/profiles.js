import { Profile } from "../models/profile.js"
import { uploadImage } from "./pets.js"

export async function show(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    .populate([
      { path: 'pets'},
      // { path: 'careCards', 
      //   populate: {
      //     path: 'trackers', 
      //     options: { sort: { createdAt: -1 }, limit: 1 }
      //   }
      // }
    ])
    reply.code(200).send(profile)
  } catch (error) {
    console.error(error)
    reply.code(500).send({ error: error.message })
  }
}

export async function update(req, reply) {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      req.body,
      { new: true }
    ).populate({path: 'pets'})
    reply.code(200).send(profile)
  } catch (error) {
    console.error(error)
    reply.code(500).send({ error: error.message })
  }
}

export async function addPhoto(req, reply) {
  try {
    console.log('request', req)
    console.log('request file', req.file)
    const profile = await Profile.findById(req.user.profile)
    const binaryData = req.file.buffer
    const result = await uploadImage(binaryData)
    profile.photo = result
    await profile.save()
    reply.code(200).send({message: 'Success', url: result})
  } catch (error) {
    console.error(error)
    reply.code(500).send({message: 'Upload failed', error: error})
  }
}
