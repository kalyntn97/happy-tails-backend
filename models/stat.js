import mongoose from 'mongoose'
import { Schema } from "mongoose"

const recordSchema = new Schema({
  value: { type: Number },
  notes: { type: String }
}, {
  timestamps: true
})

const statSchema = new Schema({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' },
  name: { type: String },
  records: [recordSchema],
  unit: { type: String },
}, {
  timestamps: true
})

const Stat = mongoose.model('Stat', statSchema)

export { Stat }