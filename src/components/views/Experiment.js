import React from 'react';
import gravatar from 'gravatar';

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
            termsAndDescriptions.push(<dd key={i + 1}>{count.toLocaleString('en-US')}</dd>);

        }

        i += 2;
    }

    termsAndDescriptions.push(<dt key={i + 1}>Total</dt>);
    termsAndDescriptions.push(<dd key={i + 2}>{total.toLocaleString('en-US')}</dd>);

    return <dl>{termsAndDescriptions}</dl>;
}

function getGravatarURL(email) {
    return gravatar.url(email, {
        rating: 'g',
        default: 'mm',
    });
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
                    <section id="experiment-authors">
                        <h4>Authors</h4>
                        <ul>
                            {props.authors.map((contact, index) => (
                                <li key={index}>
                                    <a href={`mailto:${contact.email}`}>
                                        <img src={getGravatarURL(contact.email)} alt={contact.name} />
                                        <span>{contact.name}</span>
                                    </a>
                                </li>
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
