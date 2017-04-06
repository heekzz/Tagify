'use strict';

import React from 'react';
import { Link } from 'react-router';
import Menu from './Menu';
import SearchField from './SearchField';

export default class Layout extends React.Component {
  render() {
    return (
      <div className="app-container">
        <Menu/>
        <div className="container">
            <SearchField/>
        </div>
      </div>
    );
  }
}
