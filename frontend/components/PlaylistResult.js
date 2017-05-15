/**
 * Created by Fredrik on 2017-04-11.
 */
import React from 'react';
import { Link } from 'react-router';
import {Popover, OverlayTrigger} from 'react-bootstrap';

export default class PlaylistResult extends React.Component {
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

    render() {
        const img_url = this.getImg();

        // Popover containing a list of tracks in the playlist
        const tracksPopover = (
            <Popover title="Tracks">
                {this.generateTracksList()}
            </Popover>
        );

        return (
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="thumbnail" >
                    <a href={this.props.external_urls.spotify}>
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
                        <p>Tags: <b>#{this.props.matching_tags.join(', #')}</b> {this.props.nonmatching_tags.length > 0 ? ", #": ""}{this.props.nonmatching_tags.join(', #')}</p>
                        <p>
                            <button className="btn btn-green btn-xs">Follow</button>
                            <OverlayTrigger trigger="click" rootClose placement="top" overlay={tracksPopover}>
                                <button className="btn btn-default btn-xs" >Tracks</button>
                            </OverlayTrigger>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}