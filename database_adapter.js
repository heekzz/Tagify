var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://localhost:27017/Tagify";
var playlists;


module.exports = {
    // TODO: should create the database if it doesn't exist
    init: function () {
        MongoClient.connect(conn, function (err, db) {
            if (err) {
                return console.dir(err);
            }
            else {
                console.log('Established connection to ', conn);
            }

            db.createCollection('Playlists', {strict: true}, function (err, collection) {
            });

            playlists = db.collection('Playlists');
        });
    },

    // TODO: should not add duplicate playlists
    addPlaylist: function (playlist) {
        playlists.insert(playlist);
    },

    // TODO: should check if the playlist exists
    removePlaylist: function (playlist_id) {
        playlists.remove({playlist_id:playlist_id});
    },

    // TODO: not yet implemented
    getPlaylists: function (user_id) {
        //var cursor = db.collection('Playlists').find( {user_id:user_id});
        //return cursor.toArray();

        return playlists.find({user_id:user_id}).toArray()
    },

    // TODO: not yet implemented
    matchingPlaylists: function (tags) {

    },

    // TODO: not yet implemented
    playlistExists: function (playlist_id) {

    },

    setTags: function (playlist_id, tags) {
        //Must always be of type array, even if empty or length = 1
        //TODO: should not allow multidimensional arrays
        if(!tags.isArray)
            if(tags.length === 0) tags = [];
            else tags = [tags];

        playlists.update({playlist_id:playlist_id}, {$set: {tags:tags}});
    },

    // TODO: should not add duplicate tags
    addTags: function (playlist_id, tags) {
        playlists.update({playlist_id:playlist_id}, {$push: {tags: {$each: tags}}});
    },

    // TODO: not yet implemented
    removeTags: function (playlist_id, tags) {

    },

    // TODO: not yet implemented
    getTags: function (playlist_id) {

    },

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
};