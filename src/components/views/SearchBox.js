import React from 'react';

import './css/SearchBox.css';


export default props => (
    <div className="search-box">
        <input type="search"
               placeholder={props.placeholder || 'Search...'}
               onKeyUp={props.onKeyUp}
        />
    </div>
);
