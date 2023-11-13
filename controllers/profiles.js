import { Profile } from "../models/profile.js"

export async function show(req, reply) {
  try {
    const profile = await Profile.findById(req.params.profileId)
    .populate({ path: 'pets'})
    reply.code(200).send(profile)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: error.message })
  }
}