const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const async = require('async');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const favicon = require('serve-favicon');
const path = require('path');

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

let app = express();

app.use(express.static(path.join(__dirname ,'frontend', 'public')))
    .use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(favicon(path.join(__dirname, 'frontend', 'public', 'img', 'favicon.ico')));

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
    let spotify_user = req.cookies.spotify_id;
    let search_tags = JSON.parse(req.params.tags)['tags'];
    db.matchingPlaylists(search_tags).then(function (playlists) {
        let spotify_playlists = [];

        // Decide which fields that should be returned by the Spotify API.
        // See https://developer.spotify.com/web-api/get-playlist/#tablepress-101
        const fields = ['id', 'description', 'name', 'external_urls.spotify', 'owner.id', 'images(height,url)', 'tracks.href', 'tracks.total', 'followers.total'];
        const fieldsParam = "fields=" + fields.join();

        /*
         * Async.each lets us do one REST call to the Spotify API for each playlist with the tag
         * It will wait for all requests to complete and then send all results back to the client in one request
         */
        async.each(playlists, function (db_playlist, callback) {
            let options = {
                url: `https://api.spotify.com/v1/users/${db_playlist.user_id}/playlists/${db_playlist.id}?${fieldsParam}`,
                headers: { 'Authorization': 'Bearer ' + spotify_access_token },
                json: true
            };
            request.get(options, function (err1, response1, playlist) {
                playlist.tags = db_playlist.tags;
                // Get track and artist name for all tracks in the playlist
                const track_fields = '&fields=items(track(name,artists(name))),total';
                options.url = playlist.tracks.href + track_fields;
                playlist.tags = db_playlist.tags;
                playlist.matching_tags = intersect(playlist.tags, search_tags);
                playlist.nonmatching_tags = diff(playlist.tags, playlist.matching_tags);
                request.get(options, function (err2, response2, tracks) {
                    // Add tracks to playlist
                    playlist.tracks = tracks;

                    // Check if user follows the playlist or not
                    options.url =  `https://api.spotify.com/v1/users/${db_playlist.user_id}/playlists/${db_playlist.id}/followers/contains?ids=${spotify_user}`;
                    request.get(options, function (err3, response3, follow) {
                        playlist.follow = follow[0];

                        // Add all responses to same array
                        spotify_playlists.push(playlist);
                        callback();
                    })
                });

            })
        }, function (err) {
            // Here we will perform something when all requests are done.
            if (err) {
                // Print error if something went wrong
                console.error(err.message)
            }
            // Return playlists sorted according to comparePlaylists
            res.send(spotify_playlists.sort(function(a, b){return comparePlaylists(a,b)}));
        });
    });

});

// Finds intersecting values of two arrays (a ∩ b)
function intersect(a, b) {
    return a.filter(function(n) {
        return b.indexOf(n) > -1;
    });
}

// Finds differing values of two arrays (a - b)
function diff (a, b) {
    return a.filter(function(n) {
        return b.indexOf(n) < 0 }
    );
}

// Return playlists with most matching tags first, then sort on number of followers
function comparePlaylists(a, b) {
    let mt1 = a.matching_tags.length;
    let mt2 = b.matching_tags.length;

    let f1 = a.followers.total;
    let f2 = b.followers.total;

    if (mt1 > mt2) return -1;
    if (mt1 < mt2) return 1;
    if (f1 > f2) return -1;
    if (f1 < f2) return 1;
    return 0;
}

// Updates the tags of a playlist
app.put('/playlist/tag', function (req, res) {
    db.playlistExists(req.body['id']).then((exist) => {
        if (exist) {
            db.setTags(req.body['id'], req.body['tags']);
            res.send({"success": true, "message":"Added to playlist " + req.body['id'], "input": req.body});
        } else {
            res.send({"success": false, "input": req.body});
        }
    });
});

// Adds tags to a playlist
app.post('/playlist/tag', function (req, res) {
    db.addTags(req.body['id'], req.body['tags']);
    res.send({"success": true , "input": req.body});
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

// Follow a playlist on Spotify
app.put('/playlist/follow/:user_id/:playlist_id', function (req, res) {
    let spotify_access_token = req.cookies.spotify_access_token;

    if (typeof spotify_access_token === 'undefined')
        res.send("Missing Token");
    else {
        let options = {
            url: `https://api.spotify.com/v1/users/${req.params.user_id}/playlists/${req.params.playlist_id}/followers`,
            headers: { 'Authorization': 'Bearer ' + spotify_access_token },
            json: {public: true}
        };
        request.put(options, function (error, response, body) {
            let message;
            if (!error && response.statusCode === 200) {
                message = {follow: true};
                res.send(message);
            } else {
                message = {error: body};
                res.send(message);
            }
        })
    }
});


// Unfollow a playlist on Spotify
app.delete('/playlist/follow/:user_id/:playlist_id', function (req, res) {
    let spotify_access_token = req.cookies.spotify_access_token;

    if (typeof spotify_access_token === 'undefined')
        res.send("Missing Token");

    let options = {
        url: `https://api.spotify.com/v1/users/${req.params.user_id}/playlists/${req.params.playlist_id}/followers`,
        headers: { 'Authorization': 'Bearer ' + spotify_access_token },
        json: {public: true}
    };

    request.delete(options, function (error, response, body) {
        if (response.statusCode === 200) {
            res.send({unfollow: true});
        } else {
            res.send({error: body})
        }
    })
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
            res.cookie("spotify_id", body.id);
            res.send(true);
        } else {
            res.clearCookie("username");
            res.clearCookie("spotify_access_token");
            res.clearCookie("spotify_id");
            res.send(false);
        }
    });


});


app.get('/login',
    passport.authenticate('spotify', {scope: ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'], showDialog: true}),
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

    db.getAllTags(search).then(function (t) {
        response.send(t);
    });
});

// Get user info and playlist of logged in user
app.get('/user/info', function (req, res) {
    let options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + req.cookies.spotify_access_token},
        json: true
    };

    // Get user info and playlists of user in parallel
    async.parallel([
        // Get user info from Spotify
        function(callback) {
            request.get(options, function (error, response, body) {
                if(error)
                    callback(error, null);
                callback(null, body);
            })
        },
        // Get user playlists from Spotify
        function (callback) {
            options.url = 'https://api.spotify.com/v1/me/playlists';
            request.get(options, function(error, response, body){
                if(error)
                    callback(error, null);
                callback(null, body);
            })
        }
        // Callback, sends back response to client
    ],  function (err, results) {
        if (err)
            res.send(err);
        else
            res.send({profile: results[0], playlists: results[1]});
    })
});

db.init();
let port = config.port;
console.log('Listening on ' + port);
app.listen(port);