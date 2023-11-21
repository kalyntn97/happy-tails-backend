import mongoose from 'mongoose'

const Schema = mongoose.Schema
const petSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Profile' },
  name: { type: String, required: true },
  age: { type: Number },
  species: { type: String },
  breed: { type: String },
  photo: { type: String },
  healthCard: { type: Schema.Types.ObjectId, ref: 'HealthCard' },
  careCards: [{ type: Schema.Types.ObjectId, ref: 'CareCard' }],
}, {
  timestamps: true
})

const Pet = mongoose.model('Pet', petSchema)

export { Pet }