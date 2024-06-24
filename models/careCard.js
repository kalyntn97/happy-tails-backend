import mongoose from "mongoose"
import { Pet } from "./pet.js"

const Schema = mongoose.Schema

const trackerSchema = new Schema({
  name: { type: String },
  total: { type: Number },
  done: [{ value: { type: Number }, notes: { type: String } }],
  firstDay: { type: Number }
}, {
  timestamps: true
})

const careCardSchema = new Schema({
  name: { type: String, required: true },
  medication: { 
    name: { type: String },
    amount: { type: String },
  },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' , required: true }],
  repeat: { type: Boolean, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  frequency: { type: String },
  times: { type: Number },
  color: { type: Number },
  trackers: [trackerSchema]
}, {
  timestamps: true
})

careCardSchema.index({ pets: 1 })

careCardSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const careCard = this
    await Pet.updateMany({ careCards: careCard._id }, { $pull: { careCards: careCard._id } })
    return next()
  } catch (error) {
    return next(error)
  }
})

const CareCard = mongoose.model('CareCard', careCardSchema)

export { CareCard }