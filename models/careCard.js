import mongoose from "mongoose"

const Schema = mongoose.Schema

const trackerSchema = new Schema({
  name: { type: String },
  total: { type: Number },
  done: { type: Number },
  skipped: { type: Number },
  left: { type: Number },
}, {
  timestamps: true
})

const careCardSchema = new Schema({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' , required: true },
  name: { type: String },
  times: { type: Number, default: 1 },
  frequency: { type: String },
  trackers: [trackerSchema]
}, {
  timestamps: true
})

const CareCard = mongoose.model('CareCard', careCardSchema)

export { CareCard }