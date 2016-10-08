var mongoose = require('mongoose');

// Define the issue object
var issueSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    number: {type: Number, required: true},
    state: {type: Number, required: true, default: 0},
    assignee: {type: String}
});

var Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;