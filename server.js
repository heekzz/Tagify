/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var client_id = '942710b65334402c8f285a2dbb74783f'; // Your client id
var client_secret = 'c0bf5d7b1d6640579daeeebb60979e0c'; // Your secret
var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri

// Connection to MySQL server
var pool = mysql.createPool({
	connectionLimit	: 20,
	host			: 'localhost',
	user			: 'root',
	password		: '',
	database		: 'Tagify',
	debug			: false
});


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
app.use(express.static(__dirname + '/views/pages/'))
	.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
	console.log("Access code: " + spotify_access_token);
	res.render('pages/index', {access_code: spotify_access_token})
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


})

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
	console.log("Request to /tags");
	var tag = request.query.tag;
	var query = "SELECT * FROM Tags WHERE tag LIKE '" + tag + "\%';";
	var data = null;
	console.log("Query: " + query);

	pool.getConnection(function (err, connection) {
		if (err) {
			result.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}

		console.log("Connected as id " + connection.threadId);

		// Execute SQL query
		connection.query(query, function (err, rows) {
			connection.release();
			if (!err) {
				data = rows;
				console.log(JSON.stringify(data));
				result.json(data);
			} else {
				console.error("Error during SQL query execution", err);
				result.json({"code": 100, "status": "Error in sql query", "error": err});
			}
		});

		// If error occur
		connection.on('error', function(err) {
			console.error("Error during SQL query execution", err);
			result.json({"code" : 100, "status" : "Error in connection database", "error" : err});
			return;
		});

	});
});

app.post('/getPlaylist', function (request, result) {
	console.log('Request to /getPlaylist');
	var tags = request.body;
	console.log(tags);
	for (var i = 0; i < tags.length; i++) {
		console.log(tags[i]);
	}
	var query = "SELECT * FROM Playlists p WHERE p.id IN (" +
		"SELECT  pt.playlist" +
		" FROM Playlist_Tag pt" +
		" INNER JOIN Tags t ON pt.tag = t.id" +
		" WHERE t.tag IN (";
	for (var x = 0; x < tags.length; x++) {
		query += "'" + tags[x] + "'";
		if (x != tags.length-1) {
			query += ",";
		}
	}

	query += ") GROUP BY pt.playlist HAVING COUNT(DISTINCT pt.tag) = " + tags.length + ");";
	console.log("SQL-Query: " + query);

	var data = null;
	pool.getConnection(function (err, connection) {
		if (err) {
			result.json({"code" : 100, "status" : "Error in connection database", "error" : err});
			return;
		}

		console.log("Connected as id " + connection.threadId);

		// Execute SQL query
		connection.query(query, function (err, rows) {
			connection.release();
			if (!err) {
				data = rows;
				console.log(JSON.stringify(data));
				var obj = {"playlist" : data};
				result.json(obj);
			} else {
				console.error("Error during SQL query execution", err);
				result.json({"code": 100, "status": "Error in sql query", "error": err});
			}
		});

		// If error occur
		connection.on('error', function(err) {
			console.error("Error during SQL query execution", err);
			result.json({"code" : 100, "status" : "Error in connection database", "error" : err});
			return;
		});

	});
});

console.log('Listening on 5000');
app.listen(5000);