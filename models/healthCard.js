import mongoose from "mongoose"
import { Visit } from "./visit.js"

const Schema = mongoose.Schema

const healthCardSchema = new Schema({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' },
  name: { type: String, required: true },
  details: [{ type: String }],
  type: { type: String, enum: ['Routine', 'Emergency', 'Illness'] },
  repeat: { type: Boolean, required: true },
  frequency: [
    { type: { type: String, enum: ['days', 'weeks', 'months', 'years'] } },
    { interval: { type: Number } },
    { days: { type: [Number] } }, // [1, 3 , 5] for [Mon, Wed, Fri]
    { timesPerInterval: { type: Number } }, // 2 for twice a day
  ],
  lastDone: [{ type: Schema.Types.ObjectId, ref: 'Visit' }],
  nextDue: { type: Schema.Types.ObjectId, ref: 'Visit' },
}, {
  timestamps: true
})

healthCardSchema.index({ pet: 1 })

healthCardSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const healthCard = this
    await Visit.deleteMany({ 'health': healthCard._id })
    next()
  } catch (error) {
    return next(error)
  }
})

const HealthCard = mongoose.model('HealthCard', healthCardSchema)

export { HealthCard }

