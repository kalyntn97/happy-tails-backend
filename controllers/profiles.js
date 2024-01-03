import { Profile } from "../models/profile.js"

export async function show(req, reply) {
  try {
    const profile = await Profile.findById(req.user.profile)
    .populate({ path: 'pets'})
    reply.code(200).send(profile)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: error.message })
  }
}

export async function update(req, reply) {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      req.body,
      { new: true }
    )
    reply.code(200).send(profile)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: error.message })
  }
}