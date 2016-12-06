var mongoClient=require('mongodb').MongoClient;
var mongoDbObj = null;
var connected = false;

exports.mongoDbObj = function(callback){
    mongoClient.connect('mongodb://localhost:27017/cmpe283-db', function(err, db) {
        if (err) {
            mongoDbObj = null;
            connected = false;
            callback(mongoDbObj);
        }
        else {
            console.log("Connected to MongoDB");
            mongoDbObj = {
                db: db,
                user: db.collection('User')
            };
            connected = true;
            callback(mongoDbObj);
        }
    });
};