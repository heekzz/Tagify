var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./database_adapter');
var spotify = require('./spotify_adapter');

var app = express();

app.use(express.static(__dirname + '/public'))
	.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', function (req, res) {
    console.log("Access code: " + spotify_access_token);
    res.render('index')
});

// Initializes database and creates collections
app.get('/init_db', function (req, res) {
    db.init();
    res.send("Database Initialized");
});

// Adds a new playlist
app.post('/playlist', function (req, res) {
    db.addPlaylist(req.body);
    res.send(req.body);
});

// Delete a playlist
app.delete('/playlist', function (req, res) {
    db.removePlaylist(req.body['id']);
    res.send(req.body);
});

// Gets all playlists of a user
app.get('/playlist/user_id/:user_id', function (req, res) {
    db.getPlaylists(req.params.user_id).then(function (playlists) {
		res.send(playlists);
    });
});

// Gets all playlists with specific tags
app.get('/playlist/search/:tags', function (req, res) {
	db.matchingPlaylists(JSON.parse(req.params.tags)['tags']).then(function (playlists) {
        var obj = {"playlist" : playlists};
        res.send(obj);
    });
});

// Updates the tags of a playlist
app.put('/playlist/tag', function (req, res) {
    db.setTags(req.body['id'], req.body['tags']);
    res.send(req.body);
});

// Adds tags to a playlist
app.post('/playlist/tag', function (req, res) {
    db.addTags(req.body['id'], req.body['tags']);
    res.send(req.body);
});

// Removes tags to a playlist
app.delete('/playlist/tag', function (req, res) {
    db.removeTags(req.body['id'], req.body['tags']);
    res.send(req.body);
});

// Gets all tags of a playlist
app.get('/playlist/tag/:id', function (req, res) {
    db.getTagsOfPlaylist(req.params.id).then(function (tags) {
        res.send(tags);
    });
});

app.get('/tags', function(request, response) {
    let search = request.query.tag;
    if(typeof search == "string")
    	search = search.toLowerCase();
    else
    	search = "";

    console.log("search: \'"+ search + "\'");
    //spotify.getPlaylist('spotify','59ZbFPES4DQwEjBpWHzrtC');

   	db.getAllTags(search).then(function (t) {
        console.log(t);
        response.send(t);
    });
});

app.get('/add', function (req, res) {
	spotify.addPlaylist(res);
});

app.get('/loggedin', function (req, res) {
	res.send(spotify.isLoggedin());
});

app.get('/login', function(req, res) {
	spotify.login(req, res);
});

app.get('/callback', function(req, res) {
	spotify.callback(req, res);
});

app.get('/refresh_token', function(req, res) {
	spotify.refreshToken(req, res);
});

db.init();
console.log('Listening on 5000');
app.listen(5000);