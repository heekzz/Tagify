'use strict';

import React from 'react';
import Menu from './Menu';
import cookie from 'react-cookie';
import fetch from 'isomorphic-fetch';


export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            username: undefined,
            loggedin: false
        }
    }

    componentWillMount() {
        this.checkSpotifyToken(this);
    }

    // Check with backend if token is valid
    checkSpotifyToken(component) {
        console.log("Access token: " + cookie.load("spotify_access_token"));
        fetch('/loggedin', {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                localStorage.setItem("loggedin", json);
                if (json) {
                    localStorage.setItem("username", cookie.load("username"));
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
    	// Setting props of children.
		// Children are all routes in the "routes.js" file
    	const childrenWithProps = React.Children.map(this.props.children,
			(child) => React.cloneElement(child, {
				loggedin: this.state.loggedin,
				username: this.state.username
			}));

		return (
			<div className="app-container">
				<Menu username={this.state.username} />
				<div className="container">
					{childrenWithProps}
				</div>
			</div>
		);
	}
}
