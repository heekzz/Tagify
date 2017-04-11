var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = '942710b65334402c8f285a2dbb74783f'; // Your client id
var client_secret = 'c0bf5d7b1d6640579daeeebb60979e0c'; // Your secret
var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri

var spotify_access_token = null;
var stateKey = 'spotify_auth_state';

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

// Get all information about a playlist
var getPlaylist = function (user_id, playlist_id, callback) {
    var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id,
        headers: {'Authorization': 'Bearer ' + spotify_access_token},
        json: true
    };

    var status_code = null;

    request.get(options, function (err, response, body) {
        status_code = response.statusCode;
        if (status_code == 200) {
            console.log("Got playlist: " + body['name']);
            callback(body);
            return body;
        } else {
            console.log(err);
        }
    });
};

var addPlaylist = function (req, res) {
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
};

var isLoggedin = function (req, res) {
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
            return true;
        } else {
            return false;
        }
    });
};

var login = function (req, res) {
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
};

var callback = function (req, res) {
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
                spotify_access_token = access_token;

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
};

var refreshToken = function (req, res) {
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
};

module.exports = {
    getPlaylist:getPlaylist(),
    addPlaylist:addPlaylist(),
    isLoggedin:isLoggedin(),
    login:login(),
    callback:callback(),
    refreshToken:refreshToken()
};
