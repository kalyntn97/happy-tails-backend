import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    tokens: [{ token: { type: String, required: true }}],
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' }
})

// encrypt password using bcrypt conditionally only if the user is newly created.
// hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateToken = async function() {
    let user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '72h' })
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token
}

// create a custom model method to find user by token for authentication
userSchema.statics.findByToken = async function(token) {
    let User = this
    let decoded
    try {
        if (!token) {
            return new Error('Missing token header')
        }
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return error
    }
    return await User.findOne({
        _id: decoded._id,
        'tokens.token': token
    })
}
// create a new mongoose method for user login authentication
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) {
        throw new Error('Unable to login. Wrong username!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login. Wrong Password!')
    }
    return user
}

const User = mongoose.model('User', userSchema)

export { User }