import mongoose from 'mongoose'
import { Profile } from './profile.js'
import { HealthCard } from './HealthCard.js'
import { CareCard } from './careCard.js'

const Schema = mongoose.Schema
const petSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Profile' },
  name: { type: String, required: true },
  age: { type: Number },
  species: { type: String },
  breed: { type: String },
  color: { type: Number },
  photo: { type: String },
}, {
  timestamps: true
})

petSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const pet = this
    await Profile.updateOne({ pets: pet._id }, { $pull: { pets: pet._id } })
    await HealthCard.deleteMany({ pet: pet._id })
    await CareCard.updateMany({ pets: pet._id }, { $pull: { pets: pet._id } })
    return next()
  } catch (error) {
    return next(error)
  }
})

const Pet = mongoose.model('Pet', petSchema)

export { Pet }