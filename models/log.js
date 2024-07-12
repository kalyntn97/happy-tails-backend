import mongoose from "mongoose"

const Schema = mongoose.Schema

const logSchema = new Schema({
  date: { type: Date },
  value: { type: Number, required: true, default: 0 }, //0 - not done, -1 - skipped
  notes: { type: String },
  task: { type: Schema.Types.ObjectId, ref: 'CareCard' },
}, { 
  timestamps: true
})

logSchema.index({ task: 1 })

const Log = mongoose.model('Log', logSchema)

export { Log }