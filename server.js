var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var db = require('./database_adapter');

var client_id = '942710b65334402c8f285a2dbb74783f'; // Your client id
var client_secret = 'c0bf5d7b1d6640579daeeebb60979e0c'; // Your secret
var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';
var spotify_access_token = null;
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
    db.getTags(req.params.id).then(function (tags) {
        res.send(tags);
    });
});


app.get('/add', function (req, res) {
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: { 'Authorization': 'Bearer ' + spotify_access_token },
		json: true
	};

	var loggedin;
	request.get({url:'http://localhost:5000/loggedin'}, function(error, response, body){
		loggedin = body;
		console.log("In /add \n" + body)
		if (loggedin == "true") {
			request.get(options, function (err, response_2, spotify_body) {
				console.log("In /add \n" + JSON.stringify(spotify_body));
				var object = spotify_body;
				console.log(object.display_name);

				res.render("pages/add",
					{
						loggedin: loggedin,
						name: object.display_name,
						email: object.email,
						profile_url: object.external_urls.spotify,
					});

			})
		} else {
			res.render("pages/add",
				{
					loggedin: loggedin
				})
		}
	})
});

app.get('/loggedin', function (req, res) {
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: { 'Authorization': 'Bearer ' + spotify_access_token },
		json: true
	};

	var status_code = null;

	// Try access
	request.get(options, function(error, response, body) {
		console.log("Status Code: " + response.statusCode);
		status_code = response.statusCode;
		if (status_code == 200) {
			res.send(true);
		} else {
			res.send(false);
		}
	});


});

app.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state,
			show_dialog: true
		}));
});

app.get('/callback', function(req, res) {

	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
					refresh_token = body.refresh_token;
				spotify_access_token =  access_token;

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					// console.log(body);
				});

				// we can also pass the token to the browser to make requests from there
				res.redirect('/#'
					//querystring.stringify({
					//	access_token: access_token,
					//	refresh_token: refresh_token
				);
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

app.get('/refresh_token', function(req, res) {

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				'access_token': access_token
			});
		}
	});
});

app.get('/tags', function(request, result) {
   	db.getAllTags().then(function (tags) {
        let tag = request.query.tag;
   		let data = [];
        tags.forEach(function(entry) {
            if(entry.startsWith(tag)) {
            	let i = Math.random() * 10000000000000000;
            	data.push({id:i, tag:entry});
			}
        });
        result.json(data);
	});
});

db.init();
console.log('Listening on 5000');
app.listen(5000);