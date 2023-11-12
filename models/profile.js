import mongoose from "mongoose"

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  bio: String,
  pets: [{type: Schema.Types.ObjectId}]
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }