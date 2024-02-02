import mongoose from 'mongoose'
import { Pet } from './pet.js'
import { CareCard } from './careCard.js'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: { type: String },
  photo: { type: String },
  bio: { type: String },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
  careCards: [{ type: Schema.Types.ObjectId, ref: 'CareCard' }]
}, {
  timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)

//invoked when profile is deleted
profileSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const profile = this
    await Pet.deleteMany({ 'parent': profile._id })
    await CareCard.deleteMany({ '_id': { $in: profile.careCards } })
    return next()
  } catch (error) {
    return next(error)
  }
})

export { Profile }