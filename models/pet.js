import mongoose from 'mongoose'
import { Profile } from './profile.js'
import { HealthCard } from './HealthCard.js'
import { CareCard } from './careCard.js'

const Schema = mongoose.Schema

const serviceSchema = new Schema({
  name:{ type: String },
  contact: {
    address: [{ type: String }],
    email: [{ type: String }],
    phone: [{ type: String }],
    fax: [{ type: String }],
  },
  notes: { type: String},
}, {
  timestamps: true
})

const petSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Profile' },
  editors: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  viewers: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
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
  microchip: { type: String },  
  licenses: [{ 
    name: { type: String },
    number: { type: String },
  }],
  services: [serviceSchema],
  stats: [{ type: Schema.Types.ObjectId, ref: 'Stat' }],
  careCards: [{ type: Schema.Types.ObjectId, ref: 'CareCard' }],
  healthCards: [{ type: Schema.Types.ObjectId, ref: 'HealthCard' }],
}, {
  timestamps: true
})

petSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const pet = this
    await Profile.updateOne({ pets: pet._id }, { $pull: { pets: pet._id } })
    await HealthCard.deleteMany({ pet: pet._id })
    await Stat.deleteMany({ pet: pet._id })
    await CareCard.updateMany({ pets: pet._id }, { $pull: { pets: pet._id } })
    return next()
  } catch (error) {
    return next(error)
  }
})

const Pet = mongoose.model('Pet', petSchema)

export { Pet }