'use strict';

import React from 'react';
import { Link } from 'react-router';
import Menu from './Menu';
import fetch from 'isomorphic-fetch';
import SearchField from './SearchField';
import cookie from 'react-cookie';


var empty, user;

export default class Layout extends React.Component {
	constructor(props) {
		super(props);
		this.state =  {
			username: undefined,
			loggedin: false
		}
	}

	componentDidMount() {
		this.checkSpotifyToken(this);
	}

	// Check with backend if token is valid
	checkSpotifyToken(component) {
		fetch('/loggedin')
			.then(response => response.json())
			.then(json => {
				if (json) {
					component.setState({
						loggedin: json,
						username: cookie.load("username")
					});
				}
				else {
					component.setState({
						loggedin: json
					})
				}
			})
	}


	render() {
		return (
			<div className="app-container">
				<Menu username={ this.state.username }/>
				<div className="container">
					{console.log(this.state.loggedin)}
					{/* Display login button if not logged in, otherwise show search field */}
					{this.state.loggedin ? <SearchField/> :<a type="button" className="btn btn-default" href="/login">Log in to Spotify</a>}
				</div>
			</div>
		);
	}
}
