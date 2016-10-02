var mongoose = require('mongoose');

mongoose.connect('mongodb://app:bacon@ds023435.mlab.com:23435/bacon-tracker')

// Define the user object
var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

userSchema.methods.authenticate = function(password){
    console.log("Authenticating Password");
    return this.password === password; // TODO: may want to change to password hashes in the future
}

var User = mongoose.model('User', userSchema);

module.exports = User;