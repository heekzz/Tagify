var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://localhost:27017/Tagify";


module.exports = {
    init: function () {

        // Connect to the db
        MongoClient.connect(conn, function (err, db) {
            if (err) {return console.dir(err);}
            else {console.log('Established connection to ', conn);}

            db.createCollection('Tags', {strict: true}, function (err, collection) {});

            db.createCollection('Playlists', {strict: true}, function (err, collection) {});

            db.close();
        });
    },


    insertTag: function (id, tag) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);


            var Tags = db.collection('Tags');
            var newTag = {'id': id, 'name': tag};

            Tags.insert(newTag);

            db.close();
        });
    }
};
