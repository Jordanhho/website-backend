const {
    getHashedPassword,
    compareHashedPassword
} = require("../config/hashing");

const { nanoid } = require("nanoid");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {
        type: String,
        default: () => nanoid()
    },
    userid: {
        type: String, default: () => nanoid(),
        unique: true,
        required: true,
        dropDups: true
    },
    email: { 
        type: String, 
        unique: true, 
        required: true, 
        dropDups: true 
    },
    password: { 
        type: String, 
        required: true,
        minLength: [8]
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    level: { 
        type: String, 
        enum: ['ADMIN', 'MEMBER'], 
        default: 'MEMBER',
        required: true
    },
});

UserSchema.pre("save", async function (next) {
    // store reference
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        throw new Error("Password has not been modified, it is still hashed");
    } 
    //password doesnt exist
    else if (!user.password) {
        throw new Error("Password does not exist");
    }
    else {
        const pass = await getHashedPassword(user.password);
        user.password = pass;
        next();
    }
});

//for updating password for a user
UserSchema.pre("findOneAndUpdate", async function () {
    let updateObj = { ...this.getUpdate() };
    console.log("under pre findone");
    console.log(updateObj);

    //only update password if it was modified.
    if (updateObj.password) {
        const hashedPassword = await getHashedPassword(updateObj.password);
        updateObj.password = hashedPassword;
        console.log(updateObj);
        this.setUpdate(updateObj);
    }
});


//check if unhashed password matches hashedpassword
UserSchema.methods.comparePassword = async function (attemptPassword) {
    const user = this;
    try {
        return await compareHashedPassword(attemptPassword, user.password);
    } catch(err) {
        console.log(err);
        return err;
    }
}
module.exports = mongoose.model('user', UserSchema, "user_data");