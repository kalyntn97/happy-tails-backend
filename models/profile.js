import mongoose from 'mongoose'
import { Pet } from './pet.js'
import { CareCard } from './careCard.js'
import { HealthCard } from './HealthCard.js'

const Schema = mongoose.Schema

const streakSchema = new Schema({
  lastDate: { type: Date, default: new Date() },
  current: { type: Number, default: 0 },
  longest: { type: Number, default: 0 },
}, {
  timestamps: true
})

const profileSchema = new Schema({
  username: { type: String, unique: true },
  name: { type: String },
  photo: { type: String },
  banner: { type: String },
  bio: { type: String },
  streak: streakSchema,
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