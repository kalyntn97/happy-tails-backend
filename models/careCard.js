import mongoose from "mongoose"

const Schema = mongoose.Schema

const trackerSchema = new Schema({
  name: { type: String },
  total: { type: Number },
  done: [{ type: Date }],
  skipped: { type: Number },
  left: { type: Number },
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

const CareCard = mongoose.model('CareCard', careCardSchema)

export { CareCard }