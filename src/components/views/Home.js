import React from 'react';
import { Link } from 'react-router-dom';


export default props => {
    return (
        <article id="experiments">
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
