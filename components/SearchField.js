/**
 * Created by Fredrik on 2017-04-03.
 */
import React from 'react';
import Select from 'react-select';
import fetch from 'isomorphic-fetch';

var SearchField = React.createClass ({
    displayName: 'SearchField',
    propTypes: {
        label: React.PropTypes.string,
    },
    getInitialState () {
        return {
            backspaceRemoves: true,
            multi: true
        };
    },
    onChange (value) {
        this.setState({
            value: value,
        });
    },
    getTags (input) {
        // if (!input) {
        //     return Promise.resolve({ options: [] });
        // }
        console.log("Input: " + input);
        return fetch(`/tags?tag=${input}`)
            .then((response) => {
                console.log(response.status);
                return response.json()
            })
            .then((json) => {
                console.log(json);
                return { options: json};
            });
    },
    render () {
        return (
            <div className="section">
                <Select.Async multi={this.state.multi} value={this.state.value} onChange={this.onChange} valueKey="_id" labelKey="tag" loadOptions={this.getTags} backspaceRemoves={this.state.backspaceRemoves} />
            </div>
        );
    }
});

module.exports = SearchField;
