import mongoose from "mongoose"
import { Pet } from "./pet.js"
import { CareCard } from "./careCard.js"

const Schema = mongoose.Schema

const medicationSchema = new Schema({
  name: { type: String },
  dosage: {
    amount: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    times: { type: Number },
    frequency: { type: String },
    reminder: { type: Schema.Types.ObjectId, ref: 'CareCard' },
  },
  refill: {
    times: { type: Number },
    frequency: { type: String },
    reminder: { type: Schema.Types.ObjectId, ref: 'CareCard' },
  },
  status: { type: String },
  illness: { type: Schema.Types.ObjectId, ref: 'Illness' },
  notes: [{ content: { type: String } }],
}, {
  timestamps: true
})

medicationSchema.pre(['deleteOne', 'deleteMany'], { document: true, query: false }, async function (next) {
  try {
    const medication = this
    await Pet.updateOne({ medications: medication._id }, { $pull: { medications: medication._id } })
    if (medication.dosage.reminder || medication.refill.reminder) {
      await CareCard.deleteMany({ $or: [
        { _id: medication.dosage.reminder },
        { _id: medication.refill.reminder }
      ] })
    }
    return next()
  } catch (error) {
    return next(error)
  }
})

const Medication = mongoose.model('Medication', medicationSchema)

export { Medication }