import mongoose from "mongoose"

const Schema = mongoose.Schema

const timelineSchema = new Schema({
  startDate: { type: Date }, 
  endDate: { type: Date },
  notes: [{ content: { type: String } }],
}, {
  timestamps: true
})

const illnessSchema = new Schema({
  name: { type: String },
  type: { type: String},
  timeline: [timelineSchema],
  description: { type: String },
  medications: [{ type: Schema.Types.ObjectId, ref: 'Medication'}],
  status: { type: String },
}, {
  timestamps: true
})

const Illness = mongoose.model('Illness', illnessSchema)

export { Illness }