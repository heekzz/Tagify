/**
 * Created by Fredrik on 2017-04-11.
 */
import React from 'react';
import { Link } from 'react-router';
import cookie from 'react-cookie';
import {Popover, OverlayTrigger} from 'react-bootstrap';

export default class PlaylistResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {follow: props.follow};
        this.follow = this.follow.bind(this);
        this.unfollow = this.unfollow.bind(this);
    }

    // Get a image with width 300 if existing, otherwise take first image
    getImg(){
        let images = this.props.images;
        for (let i = 0; i < images.length; i++) {
            if (images[i].height === 300)
                return images[i].url;
        }
        return images[0].url;
    }

    // Map tracks of a playlist to a list
    generateTracksList() {
        let tracks = this.props.tracks.items;
        let list = tracks.map(function(item, i) {
            return <p key={i}><strong>{item.track.name}</strong> - {item.track.artists[0].name}</p>;
        });
        return (
            <div className="tracks-scrollable">
                {list}
            </div>
        )
    }

    // Follow the playlist
    follow() {
        fetch(`/playlist/follow/${this.props.owner.id}/${this.props.id}`, {
            method: 'PUT',
            credentials: 'include'
        }).then((response) => response.json())
            .then((json) => {
                if (json.follow === true) {
                    this.setState({
                        follow: true
                    });
                }
            })
    }

    // Unfollow the playlist
    unfollow() {
        fetch(`/playlist/follow/${this.props.owner.id}/${this.props.id}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then((response) => response.json())
            .then((json) => {
                if (json.unfollow === true) {
                    this.setState({
                        follow:false
                    });
                }
            })
    }

    render() {
        const img_url = this.getImg();
        let spotify_user = cookie.load("spotify_id");
        let followButton = null;

        if (this.props.owner.id === spotify_user) {
            followButton = <button className="button-disabled" title="You own this playlist" disabled={true}>Owner</button>;
        } else if (this.state.follow === false) {
            followButton = <button className="button-green" title="Click to follow this playlist" onClick={this.follow}>Follow</button>;
        } else {
            followButton = <button className="button-red" title="You already follows this playlist, click to unfollow" onClick={this.unfollow}>Unfollow</button>;
        }

        // Popover containing a list of tracks in the playlist
        const tracksPopover = (
            <Popover title="Tracks" id={"track" + this.props.id}>
                {this.generateTracksList()}
            </Popover>
        );

        return (
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="thumbnail" >
                    <a href={this.props.external_urls.spotify} target="_blank">
                        <div className="hoverContainer">
                            <img className="coverArt" src={img_url} alt={this.props.name} />
                            <div className="overlay">
                                <div className="textOverlay"><span className="glyphicon glyphicon-play" aria-hidden="true"></span></div>
                            </div>
                        </div>
                    </a>
                    <div className="caption">
                        <h3>{this.props.name}</h3>
                        <p>Owner: {this.props.owner.id}</p>
                        <p>Tracks: {this.props.tracks.total}</p>
                        <p>Tags: <b>#{this.props.matching_tags.join(' #')}</b>{this.props.nonmatching_tags.length > 0 ? " #": ""}{this.props.nonmatching_tags.join(' #')}</p>
                        <div className="playlist-button-group">
                            {/*<button className="button-follow" onClick={this.follow}>Follow</button>*/}
                            {followButton}
                            <OverlayTrigger trigger="click" rootClose placement="top" overlay={tracksPopover}>
                                <button className="button-black" title="Show tracks of this playlist" >Tracks</button>
                            </OverlayTrigger>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}