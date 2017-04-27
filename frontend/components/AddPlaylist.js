/**
 * Created by Fredrik on 2017-04-16.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import {Modal} from 'react-bootstrap';

export default class AddPlaylist extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            showModal: false,
            modalPlaylist: undefined,
            profile: undefined,
            playlists: []
        };
    }

    componentDidMount() {
        fetch('/user/info', {credentials:'include'})
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.setState({
                    profile: json.profile,
                    playlists: json.playlists
                });
            });
    }

    render() {
        let content = null;
        if (typeof this.state.profile !== 'undefined')
            content = (
                <div>
                    <Profile profile={this.state.profile} />
                    <div className="row equal-height">
                        {this.state.playlists.items.map(playlist => <Playlist key={playlist.id} playlist={playlist} />)}
                    </div>
                </div>
            );
        return (
            <div className="add-playlist-container container">
                {/* Display user info */}
                {content}
                {/*{modal}*/}
            </div>
        )
    }

}


class Profile extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-4 col-sm-6 col-xs-12">
                    <img src={this.props.profile.images[0].url} alt="Profile image" className="img-rounded" />
                </div>
                <div className="col-md-8 col-sm-6 col-xs-12">
                    <h3>{this.props.profile.display_name ? this.props.profile.display_name: this.props.profile.id}</h3>
                    <p><a href={this.props.profile.external_urls.spotify}>Spotify profile</a></p>
                    <p>Followers: {this.props.profile.followers.total}</p>
                </div>
            </div>
        )
    }
}


class Playlist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }
    openModal() {
        this.setState({
            showModal: true
        });
        console.log("Clicked: " );
    }
    closeModal() {
        this.setState({
            showModal: false
        })
    }

    render() {
        console.log("Modal: " + this.state.showModal);
        return (
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="thumbnail">
                    <img src={this.props.playlist.images[0].url} alt="Playlist cover"/>
                    <div className="caption">
                        <h3>{this.props.playlist.name}</h3>
                        <button className="btn btn-primary" onClick={this.openModal}>Edit tags</button>
                    </div>
                    <AddModal key={this.props.playlist.id} playlist={this.props.playlist} showModal={this.state.showModal} close={this.closeModal} />

                </div>
            </div>
        )
    }
}


class AddModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: props.showModal
        };
        // this.close = this.close.bind(this);
    }
     // close() {
     //    this.setState({
     //        showModal: false
     //    });
     // }

    render() {
        console.log("SHow modal: " + this.state.showModal);
        return (
            <Modal show={this.props.showModal} onHide={this.props.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit tags for {this.props.playlist.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>Hello World!</h3>
                </Modal.Body>
            </Modal>
        )
    }
}