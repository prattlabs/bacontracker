var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// Define the user object
var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}],
    colabProjects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}]
});

userSchema.methods.authenticate = function(password){
    return this.password === password; // TODO: may want to change to password hashes in the future
}

userSchema.plugin(deepPopulate);

var User = mongoose.model('User', userSchema);

module.exports = User;