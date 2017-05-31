'use strict';

import React from 'react';

import SearchField from './SearchField';

/*
 * Component for the index page that either shows the login dialog or the search field
 */
export default class IndexPage extends React.Component {


    render() {
        let content;
        // Render search field if logged in
        if(this.props.loggedin)
            content =   <SearchField />;
        // Otherwise we show login Modal
        else {
            content = (
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Welcome to Tagify</h4>
                            </div>
                            <div className="modal-body">
                                <p>In order to get your hands on all the wonderful content on Tagify we need you to authorize with a Spotify account.</p>
                                <p>Click login to login with your Spotify account or click Register to get to Spotify's registration page and create one (it's free 😸).</p>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-primary" href="/login">Log in with Spotify</a>
                                <a type="button" className="btn btn-default" href="https://www.spotify.com/se/signup/">Register</a>
                            </div>
                        </div>
                    </div>
            )
        }
        return (
            <div className="home">
                {console.log("Logged in: " + this.props.loggedin)}
                {/* Display login button if not logged in, otherwise show search field */}
                {content}
            </div>
        );
    }
}
