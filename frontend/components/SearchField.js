/**
 * Created by Fredrik on 2017-04-03.
 */
import React from 'react';
import Select from 'react-select';
import fetch from 'isomorphic-fetch';
import PlaylistResult from './PlaylistResult';


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
        fetch('/playlist/search/' + JSON.stringify({tags:tags}), {credentials:'include'})
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                // Save in variable to be used in render() function
                this.setState({
                    playlists: json
                });
            })
    },

    // Fetch tags from backend and print
    getTags (input) {
        // if (!input) {
        //     return Promise.resolve({ options: [] });
        // }
        return fetch(`/tags?tag=${input}`, {credentials: 'include'})
            .then((response) => {
                return response.json()
            })
            .then((json) => {
                return { options: json};
            });
    },

    render () {
        let pl =  this.state.playlists;
        const suggestedPlaylists = "";

        let mainContent;
        if (pl.length > 0) {
            mainContent = (
                <div className="row is-flex">
                    {pl.map(playlistData => <PlaylistResult key={playlistData.id} {...playlistData} />)}
                </div>
            );
        } else {
            mainContent = (
                <div>
                    <div className="page-header">
                        <h1>Welcome!</h1>
                    </div>
                    <p>To get started, start searching in the search field at the top or check out some suggested playlists below!</p>
                    {suggestedPlaylists}
                </div>

            )
        }
        return (
            <div className="search-field-group">
                <div className="header">
                    <div className="search-field-wrapper">
                        {/* Search field component */}
                        <Select.Async className="search-bar" placeholder="Search for tags..." multi={this.state.multi} value={this.state.value} onChange={this.onChange} valueKey="_id" labelKey="tag" isLoading={true} loadOptions={this.getTags} backspaceRemoves={this.state.backspaceRemoves} />
                    </div>
                </div>
                <div className="container">
                    {mainContent}
                </div>
            </div>
        );
    }
});

module.exports = SearchField;
