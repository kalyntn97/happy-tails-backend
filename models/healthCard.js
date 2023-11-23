import mongoose from "mongoose"

const Schema = mongoose.Schema

const vetCardSchema = new Schema({
  name: { type: String },
  isVaccine: { type: Boolean },
  type: { type: String },
  times: { type: Number, default: 1 },
  frequency: { type: String},
  lastDone: { type: Date },
  nextDue: { type: Date, default: new Date() },
}, {
  timestamps: true
})

const healthCardSchema = new Schema({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet' , required: true },
  vetCards: [vetCardSchema]
}, {
  timestamps: true
})

const HealthCard = mongoose.model('HealthCard', healthCardSchema)

export { HealthCard }