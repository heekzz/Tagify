/**
 * Created by Fredrik on 2016-12-28.
 */

$(function() {

	$.get('/loggedin', function (data) {
		if(!data) {
			$('#spotifyModal').modal('show');

		}
	});

	/**
	 * Obtains parameters from the hash of the URL
	 * @return Object
	 */
	function getHashParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
			q = window.location.hash.substring(1);
		while ( e = r.exec(q)) {
			hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}

	function getSpotifyPlaylist(user_id, playlist_id) {
		var params = getHashParams();
		var access_token = params.access_token,
			refresh_token = params.refresh_token,
			error = params.error;
		if (error) {
			alert("There was an error during the Spotify authentication");
		} else {
			if (access_token) {
				// render a
			} else {
				$('#spotifyModal').modal('show');
			}
		}


	}

	var ms = $('#search').magicSuggest({
		method: 'get',
		queryParam: 'tag',
		displayField: 'tag',
		valueField: 'tag',
		hideTrigger: true,
		data: '/tags'
	});

	$('#searchButton').click(function () {
		console.log(JSON.stringify(ms.getSelection()));
		var index, data = ms.getSelection(), tags = [];
		for (index = 0; index < data.length; index++) {
			console.log(data[index].tag);
			tags.push(data[index].tag);
			console.log("added tags:" + tags);
			console.log("JSON Tags: " + JSON.stringify(tags))
		}
		if (tags.length > 0) {
			$.ajax({
				type: 'POST',
				url: '/getPlaylist',
				data: JSON.stringify(tags),
				dataType: 'json',
				contentType: 'application/json',
				success: function(data) {
					var source   = $("#result").html();
					var template = Handlebars.compile(source);
					console.log(template(data));
					$('#placeholder').html(template(data));
				}
			});
		}

	});
});



// Code for use with Select2 framework

/*	$(document).ready(function () {

 $('#search').select2({
 ajax: {
 url: "/tags",
 dataType: 'json',
 delay: 250,
 data: function (params) {
 return {
 tag: params.term,
 };
 },
 processResults: function(data) {
 return {
 results: $.map(data, function (item) {
 return {
 text: item.tag,
 id: item.id
 };
 })
 };
 },
 cache: true
 },
 minimumInputLength: 1
 });
 });*/