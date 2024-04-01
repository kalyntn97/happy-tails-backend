import mongoose from 'mongoose'
import { Pet } from './pet.js'
import { CareCard } from './careCard.js'
import { HealthCard } from './HealthCard.js'

const Schema = mongoose.Schema

const streakSchema = new Schema({
  streak: { type: Number, default: 0 },
  lastDate: { type: Date, default: new Date() },
  longestStreak: { type: Number, default: 0 },
}, {
  timestamps: true
})

const profileSchema = new Schema({
  name: { type: String },
  username: { type: String},
  photo: { type: String },
  banner: { type: String },
  bio: { type: String },
  reminderInterval: { type: Number, default: 30 },
  streak: streakSchema,
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
  careCards: [{ type: Schema.Types.ObjectId, ref: 'CareCard' }],
  healthCards: [{ type: Schema.Types.ObjectId, ref: 'HealthCard' }],
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