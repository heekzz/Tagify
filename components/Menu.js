import React from 'react';

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
                        <a className="navbar-brand" href="#">Brand</a>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <li><a href="/">Home</a></li>
                            <li><a href="/add">Tag my Playlist</a></li>
                        </ul>
                        <p className="navbar-text navbar-right">
                            Signed in as Fredrik
                        </p>
                    </div>
                </div>
            </nav>
        );
    }
}