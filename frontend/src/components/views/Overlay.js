import React from 'react';
import { Icon } from 'react-fa';

import './css/Overlay.css';


export default props => (
    <div id="overlay-wrapper" onClick={props.onClose}>
        <section id="overlay" onClick={props.onClick}>
            <div id="overlay-header">
                <h2>{props.title}</h2>
                <Icon id="overlay-close-button" name="times" onClick={props.onClose} />
            </div>
            <div id="overlay-content">
                {props.children}
            </div>
        </section>
    </div>
);
