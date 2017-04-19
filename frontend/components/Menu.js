import React from 'react';
import {Link} from 'react-router'
import cookie from 'react-cookie';

export default class Menu extends React.Component {
	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-bottom">
				<div className="container">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						{/*<Link to ="/" className="navbar-brand">Brand</Link>*/}
					</div>

					<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul className="nav navbar-nav">
							<li><Link to="/#">Home</Link></li>
							{this.props.username ? <li><Link to="/add">Tag my Playlist</Link></li>: ""}
						</ul>
						<p className="navbar-text navbar-right">
							{this.props.username ? "Signed in as " + this.props.username : "Not logged in"}
						</p>
					</div>
				</div>
			</nav>
		);
	}
}