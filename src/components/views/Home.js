import React from 'react';
import { Link } from 'react-router-dom';

import './css/Home.css';


export default props => {
    const activeExperiments = props.experiments.filter(e => !e.completed);
    const completedExperiments = props.experiments.filter(e => e.completed);

    let maybeActiveSection = null;
    if (activeExperiments.length) {
        maybeActiveSection = (
            <section id="active-experiments">
                <h2>Active experiments</h2>
                <nav>
                    <ul>
                        {activeExperiments.map((experiment, index) => {
                            return (
                                <li key={index}>
                                    <Link to={`/experiment/${experiment.id}/`}>{experiment.name}</Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </section>
        );
    }

    let maybeCompletedSection = null;
    if (completedExperiments.length) {
        maybeCompletedSection = (
            <section id="completed-experiments">
                <h2>Completed experiments</h2>
                <nav>
                    <ul>
                        {completedExperiments.map((experiment, index) => {
                            return (
                                <li key={index}>
                                    <Link to={`/experiment/${experiment.id}/`}>{experiment.name}</Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </section>
        );
    }

    return (
        <article id="home">
            {maybeActiveSection}
            {maybeCompletedSection}
        </article>
    );
};
