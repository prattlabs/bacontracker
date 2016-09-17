var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var http = require('http');
http.createServer(function(req, res) {
    // Connection URL
    var url = 'mongodb://localhost:27017/myproject';
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        findDocuments(db, function(docs) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end();
        });
    });
}).listen(process.env.PORT, process.env.IP);

var findDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        err != null ? console.log(err) : console.log("No errors.");
        console.log("Found the following records");
        console.dir(docs);
        callback(docs);
    });
}