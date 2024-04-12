import mongoose from "mongoose"
import { Profile } from "./profile.js"

const Schema = mongoose.Schema

const trackerSchema = new Schema({
  name: { type: String },
  total: { type: Number },
  done: [{ type: Number }],
  firstDay: { type: Number }
}, {
  timestamps: true
})

const careCardSchema = new Schema({
  name: { type: String, required: true },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' , required: true }],
  repeat: { type: Boolean, required: true },
  ending: { type: Boolean, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  frequency: { type: String },
  times: { type: Number },
  color: { type: Number },
  trackers: [trackerSchema]
}, {
  timestamps: true
})

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