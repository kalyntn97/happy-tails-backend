import mongoose from 'mongoose'
import { Profile } from './profile.js'
import { HealthCard } from './HealthCard.js'
import { CareCard } from './careCard.js'
import { Stat } from './stat.js'

const Schema = mongoose.Schema

const serviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  address: { type: String },
  email: { type: String },
  phones: [{ type: String }],
  notes: { type: String },
}, {
  timestamps: true
})

const idSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  no: { type: String },
  notes: { type: String },
}, {
  timestamps: true
})

const petSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Profile' },
  editors: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  name: { type: String, required: true },
  species: { type: String },
  breed: { type: String },
  dob: { type: Date },
  firstMet: { type: Date },
  altered: {
    value: { type: Boolean },
    date: { type: Date },
  },
  status: {
    value: { type: String },
    date: { type: Date },
    show: { type: Boolean },
  },
  color: { type: Number },
  photo: { type: String },
  icon: { type: Number },
  ids: [idSchema],
  services: [serviceSchema],
}, {
  timestamps: true
})

petSchema.index({ admin: 1 })
petSchema.index({ editors: 1 })

petSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const pet = this
    await Promise.all([
      CareCard.updateMany({ pets: pet._id }, { $pull: { pets: pet._id } }),
      HealthCard.deleteMany({ pet: pet._id }),
      Stat.deleteMany({ pet: pet._id })
    ])
    return next()
  } catch (error) {
    return next(error)
  }
})

const Pet = mongoose.model('Pet', petSchema)

export { Pet }