import React from 'react';

import MetricContainer from '../containers/MetricContainer';

import './css/Experiment.css';


export default props => {
    return (
        <article id="experiment">
            <h2>{props.name}</h2>
            <section id="metrics">
                {props.metrics.map(metricId => (
                    <MetricContainer key={metricId} metricId={metricId} />
                ))}
            </section>
        </article>
    );
};
