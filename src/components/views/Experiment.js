import React from 'react';

import MetricContainer from '../containers/MetricContainer';

import './css/Experiment.css';


function getCountDL(populations, accessor) {
    const termsAndDescriptions = [];
    let total = 0;
    let i = 0;
    for (const populationName in populations) {
        if (populations.hasOwnProperty(populationName)) {

            const count = populations[populationName][accessor];
            total += count;

            termsAndDescriptions.push(<dt key={i}>{populationName}</dt>);
            termsAndDescriptions.push(<dd key={i + 1}>{count}</dd>);

        }

        i += 2;
    }

    termsAndDescriptions.push(<dt key={i + 1}>Total</dt>);
    termsAndDescriptions.push(<dd key={i + 2}>{total}</dd>);

    return <dl>{termsAndDescriptions}</dl>;
}

export default props => {
    return (
        <article id="experiment">
            <h2>{props.name}</h2>
            <div id="experiment-content">
                <section id="experiment-details">
                    <h3>Details</h3>
                    <section id="experiment-description">
                        <h4>Description</h4>
                        <p>{props.description}</p>
                    </section>
                    <section id="experiment-counts">
                        <h4>Counts</h4>
                        <section id="experiment-client-counts">
                            <h5>Clients</h5>
                            {getCountDL(props.populations, 'total_clients')}
                        </section>
                        <section id="experiment-ping-counts">
                            <h5>Pings</h5>
                            {getCountDL(props.populations, 'total_pings')}
                        </section>
                    </section>
                    <section id="experiment-contacts">
                        <h4>Contacts</h4>
                        <p>Contact the following with any questions about this report:</p>
                        <ul>
                            {props.contacts.map((contact, index) => (
                                <li key={index}><a href={`mailto:${contact.email}`}>{contact.name}</a></li>
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
            </div>
        </article>
    );
};
