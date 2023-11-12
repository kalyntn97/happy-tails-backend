import mongoose from 'mongoose'

const Schema = mongoose.Schema
const petSchema = new Schema({
  // parent: {
    
  // },
  name: { type: String, requestuired: true },
  age: { type: Number },
  species: { type: String },
  breed: { type: String }
})

const Pet = mongoose.model('Pet', petSchema)

export { Pet }