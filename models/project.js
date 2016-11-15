var mongoose = require('mongoose');

// Define the project object
var projectSchema = new mongoose.Schema({
    _nextinum: {type: Number, default: 1},
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    issues: [{type: mongoose.Schema.Types.ObjectId, ref: "Issue"}],
    issueOrder: {type: String}
});

var Project = mongoose.model('Project', projectSchema);

module.exports = Project;