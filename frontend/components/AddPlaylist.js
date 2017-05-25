/**
 * Created by Fredrik on 2017-04-16.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import {Modal} from 'react-bootstrap';
import { AsyncCreatable } from 'react-select';

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
                <div className="container">
                    <div className="profile-wrapper">
                        <Profile profile={this.state.profile} />
                    </div>
                    <div className="row is-flex">
                        {this.state.playlists.items.map(playlist => <Playlist key={playlist.id} playlist={playlist} />)}
                    </div>
                </div>
            );
        return content;
    }

}


class Profile extends React.Component {
    render() {
        let profile_img = null;
        if (this.props.profile.images[0])
            profile_img = this.props.profile.images[0].url;
        else
            profile_img = '/img/default_user.jpg';

        return (
            <div className="row">
                <div className="col-md-4 col-sm-6 col-xs-12">
                    <img src={profile_img} alt="Profile image" className="img-rounded" />
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
    }
    closeModal() {
        this.setState({
            showModal: false
        })
    }

    render() {
        return (
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="thumbnail">
                    <img src={this.props.playlist.images[0].url} alt="Playlist cover"/>
                    <div className="caption">
                        <h3>{this.props.playlist.name}</h3>
                        <button className="btn btn-primary btn-xs" onClick={this.openModal}>Edit tags</button>
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
            showModal: props.showModal,
            tags:[]
        };
        this.addTag = this.addTag.bind(this);
        this.getTags = this.getTags.bind(this);
        this.removeTag = this.removeTag.bind(this);
    }

    componentWillMount() {
        this.getTags();
    }

    changeTags() {

    }

    getTags() {
        fetch('/playlist/tag/' + this.props.playlist.id)
            .then((response) =>  response.json())
            .then((json) => {
                this.setState({
                    tags:json
                })
            });
    }

    createPlaylist(tags) {
        let playlist = {
            "id": this.props.playlist.id,
            "user_id": this.props.playlist.owner.id,
            "tags": tags
        };

        fetch('/playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlist)
        }).then((response) => response.json())
            .then(() => {
                this.getTags();
            });
    }

    addTag(value) {
        // Use http method PUT if no tags exists, otherwise use POST
        let method = this.state.tags.length > 0 ? 'POST': 'PUT';

        let newTag = {};
        newTag.id = this.props.playlist.id;
        newTag.tags = [value.tag];

        fetch('/playlist/tag', {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTag)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.success) {
                this.getTags();
            } else {
                this.createPlaylist(newTag.tags);
            }
        });
    }

    getAllTags(input) {
        return fetch(`/tags?tag=${input}`, {credentials: 'include'})
            .then((response) => {
                return response.json()
            })
            .then((json) => {
                return { options: json};
            })
    }

    removeTag(tag) {
        let body = {"id": this.props.playlist.id, tags:[tag]};
        fetch('/playlist/tag', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then((response) => response.json())
            .then(()=> {
                this.getTags();
            });
    }

    render() {
        let t = this.state.tags;
        let tags = t.map((tag , i) =>
            <li key={i}>{tag} <a className="remove-tag" onClick={() => this.removeTag(tag)}> <span className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></li>
        );
        return (
            <Modal show={this.props.showModal} onHide={this.props.close}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>Edit tags for {this.props.playlist.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>Edit tags:</h3>
                    <ul>{tags}</ul>
                    <AsyncCreatable placeholder="Search for tags..." value={this.state.value} onChange={this.addTag} valueKey="_id" labelKey="tag" isLoading={true} loadOptions={this.getAllTags} backspaceRemoves={this.state.backspaceRemoves} />
                </Modal.Body>
            </Modal>
        )
    }
}