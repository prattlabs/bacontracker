var mongoose = require('mongoose');

// Define the project object
var projectSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    issues: [{type: mongoose.Schema.Types.ObjectId, ref: "Issue"}]
});

var Project = mongoose.model('Project', projectSchema);

module.exports = Project;