import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Profile } from './profile.js'

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, {
    timestamps: true
})

// encrypt password using bcrypt conditionally only if the user is newly created.
// hash the plain text password before saving
userSchema.pre('save', async function(next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})
// delete profile if user is deleted
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		const user = this
		await Profile.deleteOne({ '_id': user.profile })
		return next()
	} catch (error) {
		return next(error)
	}
})

userSchema.methods.generateToken = async function() {
	let user = this
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '72h' })
	user.token = token
	await user.save()
	return token
}

userSchema.methods.comparePasswords = async function(passwordToCompare) {
	let user = this
	const isMatch = await bcrypt.compare(passwordToCompare, user.password)
	if (!isMatch) {
		throw new Error('Passwords do not match.')
	}
	return isMatch
}

// create a custom model method to find user by token for authentication
userSchema.statics.findByToken = async function(token) {
	let User = this
	let decoded

	decoded = jwt.verify(token, process.env.JWT_SECRET)

	if (!decoded) {
		throw new Error ('Error decoding the token')
	}

	return await User.findOne({_id: decoded._id })
}

// create a new mongoose method for user login authentication
userSchema.statics.findByCredentials = async (username, password) => {
	const user = await User.findOne({ username })
	if (!user) {
		throw new Error('No username found.')
	}
	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) {
		throw new Error('Wrong password entered.')
	}
	return user
}

const User = mongoose.model('User', userSchema)

export { User }