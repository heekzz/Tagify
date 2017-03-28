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

            db.createCollection('Playlists', {strict: true}, function (err, collection) {});

            playlists = db.collection('Playlists');

            playlists.createIndex({playlist_id:1},{unique:true});
        });
    },

    addPlaylist: function (playlist) {
        playlists.insert(playlist);
    },

    removePlaylist: function (playlist_id) {
        playlists.remove({playlist_id:playlist_id});
    },

    getPlaylists: function (user_id) {
        return playlists.find({user_id:user_id}).toArray()
    },

    // TODO: should require all tags?
    matchingPlaylists: function (tags) {
        return playlists.find({tags: {$in: tags}}).toArray()
    },

    // TODO: could be more efficient using findOne
    playlistExists: function (playlist_id) {
        return playlists.find({playlist_id:playlist_id}).toArray().then(function (p){
            return Boolean(p.length);
        });
    },

    setTags: function (playlist_id, tags) {
        //Must always be of type array, even if empty or length = 1
        //TODO: should not allow multidimensional arrays
        if(!tags.isArray)
            if(tags.length === 0) tags = [];
            else tags = [tags];

        playlists.update({playlist_id:playlist_id}, {$set: {tags:tags}});
    },

    addTags: function (playlist_id, tags) {
        playlists.update({playlist_id:playlist_id}, {$addToSet: {tags: {$each: tags}}});
    },

    removeTags: function (playlist_id, tags) {
        playlists.update({playlist_id:playlist_id}, {$pull: {tags: {$in : tags}}});
    },

    getTags: function (playlist_id) {
        return playlists.findOne({playlist_id:playlist_id}).then(function (p){
            return p['tags'];
        });
    }
};