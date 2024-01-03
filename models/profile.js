import mongoose from "mongoose"

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: { type: String },
  photo: { type: String },
  bio: { type: String },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }]
}, {
  timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }