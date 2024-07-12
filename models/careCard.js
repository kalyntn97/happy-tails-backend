import mongoose from "mongoose"
import { Log } from "./log.js"

const Schema = mongoose.Schema

const careCardSchema = new Schema({
  name: { type: String, required: true },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' , required: true }],
  details: [{ type: String }],
  repeat: { type: Boolean, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  frequency: {
    type: { type: String, enum: ['days', 'weeks', 'months', 'years'] },
    interval: { type: Number },
    days: { type: [Number] }, //[1, 3 , 5] for [Mon, Wed, Fri]
    timesPerInterval: { type: Number }, //2 for twice a day
  },
  color: { type: Number },
  icon: { type: String },
}, {
  timestamps: true
})

careCardSchema.index({ pets: 1 })

careCardSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const careCard = this
    await Log.deleteMany({ 'task': careCard._id })
    next()
  } catch (error) {
    return next(error)
  }
})

const CareCard = mongoose.model('CareCard', careCardSchema)

export { CareCard }