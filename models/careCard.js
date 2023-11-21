import mongoose from "mongoose"

const Schema = mongoose.Schema

const trackerSchema = new Schema({
  total: { type: Number },
  done: { type: Number },
  skipped: { type: Number },
}, {
  timestamps: true
})

const careCardSchema = new Schema({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' , required: true },
  name: { type: String },
  frequency: { type: String },
  trackers: [trackerSchema]
}, {
  timestamps: true
})

const CareCard = mongoose.model('HealthCard', careCardSchema)

export { CareCard }