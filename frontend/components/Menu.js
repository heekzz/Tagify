import React from 'react';
import {Link} from 'react-router'
import cookie from 'react-cookie';

/*
 * Component for the menu at bottom. Displays name of logged in user if logged in
 *
 * Only displays options for adding tags if logged in
 *
 */
export default class Menu extends React.Component {
	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-bottom">
				<div className="container">
					<div className="navbar-header">
						{/* "Burger"-menu button when collapsed for mobile devices */}
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
					</div>

					<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul className="nav navbar-nav">
							<li><Link to="/">Home</Link></li>
							{this.props.username ? <li><Link to="/add">Tag my Playlist</Link></li>: ""}
						</ul>
						<p className="navbar-text navbar-right">
							{/* Displays name if logged in, otherwise informing text */}
							{this.props.username ? "Signed in as " + this.props.username : "Not logged in"}
						</p>
					</div>
				</div>
			</nav>
		);
	}
}