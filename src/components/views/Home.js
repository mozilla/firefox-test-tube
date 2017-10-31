import React from 'react';

import ExperimentsTable from './ExperimentsTable';

import './css/Home.css';


export default props => {
    const activeExperiments = props.experiments.filter(e => !e.completed);
    const completedExperiments = props.experiments.filter(e => e.completed);

    let maybeActiveSection = null;
    if (activeExperiments.length) {
        maybeActiveSection = (
            <section id="active-experiments">
                <h2>Active experiments</h2>
                <ExperimentsTable experiments={activeExperiments} />
            </section>
        );
    }

    let maybeCompletedSection = null;
    if (completedExperiments.length) {
        maybeCompletedSection = (
            <section id="completed-experiments">
                <h2>Completed experiments</h2>
                <ExperimentsTable experiments={completedExperiments} />
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
