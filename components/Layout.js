'use strict';

import React from 'react';
import { Link } from 'react-router';
import Menu from './Menu';

export default class Layout extends React.Component {
  render() {
    return (
      <div className="app-container">
        <Menu/>
        <div className="app-content">{this.props.children}</div>
      </div>
    );
  }
}
