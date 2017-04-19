const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const async = require('async');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

const db = require('./database_adapter');
const config = require('./config');

const client_id = '942710b65334402c8f285a2dbb74783f'; // Your client id
const client_secret = 'c0bf5d7b1d6640579daeeebb60979e0c'; // Your secret
const redirect_uri = config.spotify_callback; // Your redirect uri

passport.use(new SpotifyStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: redirect_uri
}, function (accessToken, refreshToken, profile, done) {
    return done(null, accessToken);
}));

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
let generateRandomString = function(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

const stateKey = 'spotify_auth_state';
// let spotify_access_token = null;
let app = express();

app.use(express.static(__dirname + '/frontend/public'))
    .use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', './frontend/views');

// Initiate passport
app.use(passport.initialize());
// .. also support for Passport persistent login sessions
app.use(passport.session());

app.get('/', function (req, res) {
    // console.log("Access code: " + spotify_access_token);
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
    let spotify_access_token = req.cookies.spotify_access_token;
    db.matchingPlaylists(JSON.parse(req.params.tags)['tags']).then(function (playlists) {
        let spotify_playlists = [];

        // Decide which fields that should be returned by the Spotify API.
        // See https://developer.spotify.com/web-api/get-playlist/#tablepress-101
        const fields = ['description', 'name', 'external_urls.spotify', 'owner.id', 'images(height,url)', 'tracks.href', 'tracks.total'];
        const fieldsParam = "fields=" + fields.join();

        /*
         * Async lets us do one REST call to the Spotify API for each playlist with the tag
         * It will wait for all requests to complete and then send all results back to the client in one request
         */
        async.each(playlists, function (db_playlist, callback) {
            let options = {
                url: `https://api.spotify.com/v1/users/${db_playlist.user_id}/playlists/${db_playlist.id}?${fieldsParam}`,
                headers: { 'Authorization': 'Bearer ' + spotify_access_token },
                json: true
            };
            request.get(options, function (err1, response1, playlist) {
                // Get track and artist name for all tracks in the playlist
                const track_fields = '&fields=items(track(name,artists(name)))';
                options.url = playlist.tracks.href + track_fields;
                request.get(options, function (err2, response2, tracks) {
                    playlist.tracks = tracks.items;

                    // Add all responses to same array
                    spotify_playlists.push(playlist);
                    callback();
                });

            })
        }, function (err) {
            // Here we will perform something when all requests are done.
            if (err) {
                // Print error if something went wrong
                console.error(err.message)
            }
            res.send(spotify_playlists);
        });
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



app.get('/loggedin', function (req, res) {
    let spotify_access_token = req.cookies.spotify_access_token;
    let options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + spotify_access_token },
        json: true
    };

    let status_code = null;

    // Try access
    request.get(options, function(error, response, body) {
        status_code = response.statusCode;
        if (status_code === 200) {
            res.cookie("username", body.display_name ? body.display_name : body.id);
            res.send(true);
        } else {
            res.clearCookie("username");
            res.clearCookie("spotify_access_token");
            res.send(false);
        }
    });


});


app.get('/login',
    passport.authenticate('spotify', {scope: ['user-read-private', 'user-read-email'], showDialog: true}),
    function(req, res) {
        // Will not be called...
    }
);


app.get('/callback', passport.authenticate('spotify', {failureRedirect: '/'}),
    function(req, res) {
        let spotify_access_token = req.user || null;
        res.cookie("spotify_access_token", spotify_access_token);
        res.redirect('/');
    });

app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    let refresh_token = req.query.refresh_token;
    let authOptions = {
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
            let access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.get('/tags', function(request, response) {
    let search = request.query.tag;
    if(typeof search === "string")
        search = search.toLowerCase();
    else
        search = "";

    console.log("search: \'"+ search + "\'");

    //TODO: set search to lowercase
    db.getAllTags(search).then(function (t) {
        console.log(t);
        response.send(t);
    });
});

db.init();
let port = config.port;
console.log('Listening on ' + port);
app.listen(port);