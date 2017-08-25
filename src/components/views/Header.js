import React from 'react';
import { Link } from 'react-router-dom';

import './css/Header.css';


export default () => (
    <header>
        <h1><Link to="/">Firefox Test Tube</Link></h1>
    </header>
);
