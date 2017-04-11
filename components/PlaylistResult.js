/**
 * Created by Fredrik on 2017-04-11.
 */
import React from 'react';

export default class PlaylistResult extends React.Component {
	render() {
		const img_url = ()  => {
			let images = this.props.images;
			for (let i = 0; i < images.length; i++) {
				if (images[i].height == 300)
					return images[i];
			}
		};

		return (
			<div className="media">
				<div className="media-left">
					<a href={this.props.external_urls.spotify}>
						<img className="media-object" src={img_url} alt={this.props.name} />
					</a>
				</div>
				<div className="media-body">
					<h4 className="media-heading">{this.props.name}</h4>
					<p>Owner: {this.props.owner.id}, Tracks: {this.props.tracks.total}</p>
				</div>
			</div>
		)
	}
}