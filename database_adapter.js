var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://tagify:EDji04Y7Hb1q@mongodb.fredrikhakansson.se:27017/Tagify?authMechanism=DEFAULT&authSource=admin";
var playlists, tags;


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
            db.createCollection('Tags', {strict: true}, function (err, collection) {});

            playlists = db.collection('Playlists');
            playlists.createIndex({url:1},{unique:true});

            tags = db.collection('Tags');
            tags.createIndex({tag:1},{unique:true});
        });
    },

    addPlaylist: function (playlist) {
        playlists.insert(playlist);
    },

    removePlaylist: function (id) {
        playlists.remove({id:id});
    },

    getPlaylists: function (user_id) {
        return playlists.find({user_id:user_id}).toArray()
    },

    // TODO: should require all tags?
    matchingPlaylists: function (tags) {
        return playlists.find({tags: {$in: tags}}).toArray()
    },

    // TODO: could be more efficient using findOne
    playlistExists: function (id) {
        return playlists.find({id:id}).toArray().then(function (p){
            return Boolean(p.length);
        });
    },

    setTags: function (id, tags) {
        //Must always be of type array, even if empty or length = 1
        //TODO: should not allow multidimensional arrays
        if(!tags.isArray)
            if(tags.length === 0) tags = [];
        else if(typeof tags === 'string')
            tags = [tags];

        playlists.update({id:id}, {$set: {tags: tags}});
    },

    addTags: function (id, tags) {
        playlists.update({id:id}, {$addToSet: {tags: {$each: tags}}});
    },

    removeTags: function (id, tags) {
        playlists.update({id:id}, {$pull: {tags: {$in : tags}}});
    },

    getTags: function (id) {
        return playlists.findOne({id:id}).then(function (p){
            return p['tags'];
        });
    },

    // TODO: should have a limit!
    getAllTags: function () {
        return playlists.distinct("tags");
    }
};