import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },// username, password, hashing, solt AND Authentication field will be set by passportLocalMongoose
    displayName : {
        type: String,
        default: "Your Name"
    }
});

userSchema.plugin(passportLocalMongoose.default);//plugin() auto add username password salt hashedPassword

export default mongoose.model("User", userSchema);