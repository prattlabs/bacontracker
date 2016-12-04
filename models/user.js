var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var bcrypt = require('bcryptjs');

// Define the user object
var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}],
    colabProjects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}]
});

userSchema.methods.authenticate = function(browser_password, callback){
    bcrypt.compare(browser_password, this.password, (err, res) => {
        if(res == true){
            callback(true);
        }
        else{
            callback(false);
        }
    });
}

userSchema.plugin(deepPopulate);

var User = mongoose.model('User', userSchema);

module.exports = User;