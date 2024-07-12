import mongoose from "mongoose"

const Schema = mongoose.Schema

const serviceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  address: { type: String },
  email: { type: String },
  phones: [{ type: String }],
  notes: { type: String },
}, {
  timestamps: true
})

const visitSchema = new Schema({
  dueDate: { type: Date, required: true },
  overdue: { type: Boolean, default: false },
  scheduled: { type: Boolean, default: false },
  appointment: [{
    date: { type: Date },
    vet:  { type: serviceSchema },
  }],
  notes: { type: String },
  health: { type: Schema.Types.ObjectId, ref: 'HealthCard'},
}, {
  timestamps: true
})

visitSchema.index({ health: 1 })

const Visit = mongoose.model('Visit', visitSchema)

export { Visit }