var mongoose = require('mongoose');

// Define the issue object
var issueSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    number: {type: Number, required: true},
    state: {type: Number, default: 0},
    assignee: {type: String}
});

var Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;