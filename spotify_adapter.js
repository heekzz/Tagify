var request = require('request');
var spotify_access_token = null;

module.exports = {

    // Set the spotify_access_token
    setAccessToken: function (token) {
        spotify_access_token = token;
    },

    // Get all information about a playlist
    getPlaylist: function (user_id, playlist_id, callback) {
        var options = {
            url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id,
            headers: {'Authorization': 'Bearer ' + spotify_access_token},
            json: true
        };

        var status_code = null;

        request.get(options, function (error, response, body) {
            status_code = response.statusCode;
            if (status_code == 200) {
                console.log("Got playlist: " + body['name']);
                callback(body);
                return body;
            } else {
                console.log(err);
            }
        });
    }
};
