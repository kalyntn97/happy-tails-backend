import { Profile } from "../models/profile.js"
import { uploadImage } from "./pets.js"

export async function show(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    // .populate([
    //   { path: 'pets' },
    //   { path: 'careCards', 
    //     populate: {
    //       path: 'trackers',
    //       path: 'pets'
    //       // options: { sort: { createdAt: -1 }, limit: 1 }
    //     }
    //   },
    //   { path: 'healthCards',
    //     populate: {
    //       path: 'pet',
    //     }
    //   },
    // ])
    reply.code(200).send(profile)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
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
    reply.code(500).send(error)
  }
}

export async function addPhoto(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    const binaryData = req.file.buffer
    const url = await uploadImage(binaryData)
    profile.photo = url
    await profile.save()
    reply.code(200).send(url)
  } catch (error) {
    console.error(error)
    reply.code(500).send(error)
  }
}
