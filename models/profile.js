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

export { Profile }