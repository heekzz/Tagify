var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://localhost:27017/Tagify";


module.exports = {
    //TODO: should create the database if it doesn't exist
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

    addPlaylist: function (playlist) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            db.collection('Playlists').insert(playlist);
        });
    },

    deletePlaylist: function (playlist_id) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            db.collection('Playlists').remove({playlist_id:playlist_id});
        });
    },

    setTags: function (playlist_id, tags) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            //Must always be of type array, even if empty or length = 1
            //TODO: should not allow multidimensional arrays
            if(!tags.isArray)
                if(tags.length === 0) tags = [];
                else tags = [tags];

            db.collection('Playlists').update({playlist_id:playlist_id}, {$set: {tags:tags}});
        });
    },

    addTags: function (playlist_id, tags) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            console.log(tags);
            db.collection('Playlists').update({playlist_id:playlist_id}, {$push: {tags: {$each: tags}}});
        });
    }

    /*addTags: function (playlist_id, tags) {
        MongoClient.connect(conn, function (err, db) {
            if (err) return console.dir(err);
            else console.log('Established connection to ', conn);

            var Playlists = db.collection('Playlists');

            var P = Playlists.findOne(
                { },
                { playlist_id:playlist_id}
            );

            console.log(P);
        });
    }*/

    //TODO: removeTag: function(playlist_id){}
    //TODO: getTags: function(playlist_id){}
    //TODO: getPlaylists: function(tag){}
    //TODO: getPlaylists: function(tags){}
    //TODO: playlistExists: function(playlist_id) {return boolean}
};


/*getPlaylists: function (user_id) {
 MongoClient.connect(conn, function (err, db) {
 if (err) return console.dir(err);
 else console.log('Established connection to ', conn);

 var Playlists = db.collection('Playlists');

 Playlists.find({user_id: user_id}).toArray(function (err, result) {
 if (err) {
 console.log(err);
 } else if (result.length) {
 console.log(result);
 } else {
 console.log('No document(s) found with defined "find" criteria!');
 }
 });
 });
 },*/