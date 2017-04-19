/**
 * Created by Fredrik on 2017-04-11.
 */
import React from 'react';
import { Link } from 'react-router';

export default class PlaylistResult extends React.Component {
    getImg(){
        let images = this.props.images;
        for (let i = 0; i < images.length; i++) {
            if (images[i].height == 300)
                return images[i].url;
        }
        return images[0].url;
    }
    render() {
        const img_url = this.getImg();
        console.log("URL: " + img_url);
        return (
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="thumbnail" >
                    <a href={this.props.external_urls.spotify}>
                        <div className="hoverContainer">
                            <img src={img_url} alt={this.props.name} />
                            <div className="overlay">
                                <div className="textOverlay"><span className="glyphicon glyphicon-play" aria-hidden="true"></span></div>
                            </div>
                        </div>
                    </a>
                    <div className="caption">
                        <h3>{this.props.name}</h3>
                        <p>Owner: {this.props.owner.id}</p>
                        <p>Tracks: {this.props.tracks.total}</p>
                    </div>
                </div>
            </div>
        )
    }
}