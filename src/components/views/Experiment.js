import React from 'react';

import MetricContainer from '../containers/MetricContainer';

import './css/Experiment.css';


export default props => {
    return (
        <article id="experiment">
            <h2>{props.name}</h2>
            <section id="experiment-details">
                <h3>Details</h3>
                <section id="experiment-description">
                    <h4>Description</h4>
                    <p>{props.description}</p>
                </section>
                <section id="experiment-contacts">
                    <h4>Contacts</h4>
                    <p>Contact the following with any questions about this report:</p>
                    <ul>
                        {props.contacts.map(contact => (
                            <li><a href={`mailto:${contact.email}`}>{contact.name}</a></li>
                        ))}
                    </ul>
                </section>
            </section>
            <section id="experiment-metrics">
                <h3>Metrics</h3>
                {props.metrics.map(metricId => (
                    <MetricContainer key={metricId} metricId={metricId} />
                ))}
            </section>
        </article>
    );
};
