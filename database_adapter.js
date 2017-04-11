var MongoClient = require('mongodb').MongoClient;
var conn = "mongodb://tagify:EDji04Y7Hb1q@mongodb.fredrikhakansson.se:27017/Tagify?authMechanism=DEFAULT&authSource=admin";
var Playlists, Tags;

// TODO: should create the database if it doesn't exist
var init = function () {
    MongoClient.connect(conn, function (err, db) {
        if (err) {
            return console.dir(err);
        }
        else {
            console.log('Established connection to ', conn);
        }

        db.createCollection('Playlists', {strict: true}, function (err, collection) {});
        db.createCollection('Tags', {strict: true}, function (err, collection) {});

        Playlists = db.collection('Playlists');
        Playlists.createIndex({id:1},{unique:true});

        Tags = db.collection('Tags');
        Tags.createIndex({tag:1},{unique:true});
    });
};

var addPlaylist = function (playlist) {
    Playlists.insert(playlist);
    incrementUses(playlist['tags']);
};

// TODO: should decrement tags uses
var removePlaylist = function (id) {
    if(playlistExists(id)) {
        Playlists.find({id: id}).toArray(function (err, result) {
            console.log(result);
            //decrementUses(result['tags']);
        });
        //Playlists.remove({id: id});
    }
};

var getPlaylists = function (user_id) {
    return Playlists.find({user_id:user_id}).toArray()
};

// TODO: should require all tags?
var matchingPlaylists = function (tags) {
    return Playlists.find({tags: {$in: tags}}).toArray()
};

// TODO: could be more efficient using findOne
var playlistExists = function (id) {
    return Playlists.find({id:id}).toArray().then(function (p){
        return Boolean(p.length);
    });
}

// TODO: could be more efficient using findOne
var tagExists = function (tag) {
    return Tags.find({tag:tag}).toArray().then(function (p){
        return Boolean(p.length);
    });
};

var decrementUses = function (tags) {
    tags.forEach(function (tag) {
        tagExists(tag).then(function (exists) {
            if(exists)
                Tags.updateOne({tag: tag}, { $inc: { uses: -1} });

            Tags.deleteOne({tag:tag, uses:0});
        });
    });
};

var incrementUses = function (tags) {
    tags.forEach(function (tag) {
        tagExists(tag).then(function (exists) {
            if(exists)
                Tags.updateOne({tag: tag}, { $inc: { uses: 1} });
            else
                Tags.insertOne({tag: tag, uses: 1})
        });
    });
};

var setTags = function (id, tags) {
    //Must always be of type array, even if empty or length = 1
    //TODO: should not allow multidimensional arrays
    if(!tags.isArray)
        if(tags.length === 0) tags = [];
        else if(typeof tags === 'string')
            tags = [tags];

    Playlists.update({id:id}, {$set: {tags: tags}});
    incrementUses(tags);
};

var addTags = function (id, tags) {
    Playlists.update({id:id}, {$addToSet: {tags: {$each: tags}}});
    incrementUses(tags);
};

var removeTags = function (id, tags) {
    Playlists.update({id:id}, {$pull: {tags: {$in : tags}}});
    decrementUses(tags);
};

var getTagsOfPlaylist = function (id) {
    return Playlists.findOne({id:id}).then(function (p){
        return p['tags'];
    });
};

var getAllTags = function (search) {
    var docs = Tags.find({"tag": {$regex: ".*" + search + ".*"}}).sort( { uses: -1 } ).toArray();

    return docs;
};

module.exports = {
    init: init,
    addPlaylist: addPlaylist,
    removePlaylist: removePlaylist,
    getPlaylists: getPlaylists,
    setTags: setTags,
    addTags: addTags,
    matchingPlaylists: matchingPlaylists,
    removeTags: removeTags,
    getTagsOfPlaylist: getTagsOfPlaylist,
    getAllTags: getAllTags
};