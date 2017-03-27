var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://localhost:27017/Tagify";


module.exports = {
    init: function () {
        MongoClient.connect(conn, function (err, db) {
            if (err) {
                return console.dir(err);
            }
            else {
                console.log('Established connection to ', conn);
            }

            db.createCollection('Tags', {strict: true}, function (err, collection) {
            });

            db.createCollection('Playlists', {strict: true}, function (err, collection) {
            });
        });
    },


    addTag: function (id, tag) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            var Tags = db.collection('Tags');
            var newTag = {'id': id, 'name': tag};

            Tags.insert(newTag);
        });
    },

    addPlaylist: function (playlist) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            var Playlists = db.collection('Playlists');
            //var newPlaylist = {'user_id': "hakis", 'playlist_id': "1234", 'tags':['rock', 'pop']};

            Playlists.insert(playlist);
        });
    },

    fetchPlaylistsByUserId: function (user_id) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            var Playlists = db.collection('Playlists');
            Playlists.find({user_id: user_id}).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result.length) {
                    return result;
                } else {
                    console.log('No document(s) found with defined "find" criteria!');
                }
            });
        });
    }
};
