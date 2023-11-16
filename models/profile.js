import mongoose from "mongoose"

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  bio: String,
  pets: [{type: Schema.Types.ObjectId, ref: 'Pet'}]
}, {
  timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }