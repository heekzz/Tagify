/**
 * Created by Fredrik on 2017-04-03.
 */
import React from 'react';
import Select from 'react-select';
import fetch from 'isomorphic-fetch';
import PlaylistResult from './PlaylistResult';

var playlists = [];

var SearchField = React.createClass ({
	displayName: 'SearchField',
	propTypes: {
		label: React.PropTypes.string,
	},
	getInitialState () {
		return {
			backspaceRemoves: true,
			multi: true,
			playlists: []
		};
	},
	// When we set a new tag in the search field
	onChange (value) {
		this.setState({
			value: value,
		});
		this.getPlaylists(value);
	},

	// Get playlist info from our backend containing data from the Spotify API
	getPlaylists(values){
		// Get values from the input in search field
		let tags = [];
		values.forEach(function (value) {
			tags.push(value.tag)
		});

		// Fetch playlists from backend with corresponding tags
		fetch('/playlist/search/' + JSON.stringify({tags:tags}))
			.then((response) => {
				return response.json();
			})
			.then((json) => {
				console.log("Result:" + JSON.stringify(json.p));
				// Save in variable to be used in render() function
				this.setState({
					playlists: json.playlist
				});
				playlists = json;
			})
	},

	// Fetch tags from backend and print
	getTags (input) {
		return fetch(`/tags?tag=${input}`)
			.then((response) => {
				return response.json()
			})
			.then((json) => {
				return { options: json};
			});
	},
	render () {
		console.log("Current playlists to display:");
		let pl =  this.state.playlists;
		console.log(pl);
		return (
			<div className="section">
				{/* Search field component */}
				<Select.Async multi={this.state.multi} value={this.state.value} onChange={this.onChange} valueKey="_id" labelKey="tag" loadOptions={this.getTags} backspaceRemoves={this.state.backspaceRemoves} />
				{pl.map(playlistData => <PlaylistResult key={playlistData.id} {...playlistData} />)}
			</div>
		);
	}
});

module.exports = SearchField;
