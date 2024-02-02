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
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' , required: true }],
  name: { type: String, required: true },
  times: { type: Number, required: true },
  frequency: { type: String, required: true },
  trackers: [trackerSchema]
}, {
  timestamps: true
})

careCardSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const careCard = this
    await Profile.updateOne({ careCards: careCard._id }, { $pull: { careCards: careCard._id } })
    return next()
  } catch (error) {
    return next(error)
  }
})

const CareCard = mongoose.model('CareCard', careCardSchema)

export { CareCard }