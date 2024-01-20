import mongoose from 'mongoose'
import { Pet } from './pet.js'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: { type: String },
  photo: { type: String },
  bio: { type: String },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
  careCards: [{ type: Schema.Types.ObjectId, ref: 'CareCard' }]
}, {
  timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)

//invoked when profile is deleted
profileSchema.pre('deleteOne', (next) => {
  const profileId = this.getQuery()['_id']
  console.log('profileId', profileId)
  //deleting pets in profile
  Pet.deleteMany({ 'parent': profileId }, (error, res) => {
    if (err) {
      console.log(`Error deleting pets in profile: ${error}`)
      next(error)
    } else {
      console.log('Success deleting pets in profile')
      next()
    }
  })
})

export { Profile }