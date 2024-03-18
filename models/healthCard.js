import mongoose from "mongoose"
import { Pet } from "./pet.js"

const Schema = mongoose.Schema

const healthCardSchema = new Schema({
  name: { type: String },
  isVaccine: { type: Boolean },
  type: { type: String },
  times: { type: Number, default: 1 },
  frequency: { type: String},
  lastDone: [{ type: Date }],
  nextDue: { type: Date },
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' },
}, {
  timestamps: true
})

const HealthCard = mongoose.model('HealthCard', healthCardSchema)

healthCardSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const healthCard = this
    await Pet.updateOne({ 'healthCards': healthCard._id}, { $pull: { healthCards: healthCard._id}})
  } catch (error) {
    return next(error)
  }
})

export { HealthCard }