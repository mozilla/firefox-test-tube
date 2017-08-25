import React from 'react';
import { Link } from 'react-router-dom';

import './css/Home.css';


export default props => {
    return (
        <article id="home">
            <h2>Active experiments</h2>
            <nav>
                <ul>
                    {props.experiments.map((experiment, index) => {
                        return (
                            <li key={index}>
                                <Link to={`/experiment/${experiment.id}/`}>{experiment.name}</Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </article>
    );
};
