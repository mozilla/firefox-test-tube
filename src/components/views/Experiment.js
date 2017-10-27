import React from 'react';
import { withRouter } from 'react-router-dom';
import gravatar from 'gravatar';
import ReactPaginate from 'react-paginate';

import MetricContainer from '../containers/MetricContainer';
import URLManager from '../../lib/URLManager';

import './css/Experiment.css';
import './css/ReactPaginate.css';


class Experiment extends React.Component {
    constructor(props) {
        super(props);

        this.um = new URLManager(props.location, props.history);

        this.allMetrics = props.metrics;
        this.metricsPerPage = Number(process.env.REACT_APP_METRICS_PER_PAGE);

        this.selectedPage = Number(this.um.getQueryParameter('page')) || 1;

        this.state = { activeMetrics: this.getActiveMetrics(this.selectedPage) };
    }

    getActiveMetrics(pageNumber) {
        const firstMetricIndex = (pageNumber * this.metricsPerPage) - this.metricsPerPage;
        return this.allMetrics.slice(firstMetricIndex, firstMetricIndex + this.metricsPerPage);
    }

    getCountDL(populations, accessor) {
        const termGroups = [];
        let total = 0;

        for (const populationName in populations) {
            if (populations.hasOwnProperty(populationName)) {

                const count = populations[populationName][accessor];
                total += count;

                // Apparently wrapping a <dt> and <dd> pair in a <div> is valid. And
                // it helps with styling.
                // https://github.com/whatwg/html/pull/1945
                termGroups.push(
                    <div key={populationName}>
                        <dt>{populationName}</dt>
                        <dd>{count.toLocaleString('en-US')}</dd>
                    </div>
                );

            }
        }

        termGroups.push(
            <div key='total'>
                <dt>Total</dt>
                <dd>{total.toLocaleString('en-US')}</dd>
            </div>
        );

        return <dl>{termGroups}</dl>;
    }

    getGravatarURL(email) {
        return gravatar.url(email, {
            default: 'mm',
            rating: 'g',
            size: '100',
        });
    }

    componentWillUpdate(nextProps) {
        this.um = new URLManager(nextProps.location, nextProps.history);
    }

    render() {
        const selectedMetricId = Number(this.um.getQueryParameter('chart'));

        let maybeMetricOverlay = null;
        if (selectedMetricId !== undefined && this.state.activeMetrics.includes(selectedMetricId)) {
            maybeMetricOverlay = (
              <MetricContainer
                  experimentId={this.props.id}
                  id={selectedMetricId}
                  asOverlay={true}
              />
            );
        }

        return (
            <div>
                <article id="experiment">
                    <h2>{this.props.name}</h2>
                    <div id="experiment-content">
                        <section id="experiment-details">
                            <h3>Details</h3>
                            <section id="experiment-description">
                                <h4>Description</h4>
                                <p>{this.props.description}</p>
                            </section>
                            <section id="experiment-counts">
                                <h4>Counts</h4>
                                <section id="experiment-client-counts">
                                    <h5>Clients</h5>
                                    {this.getCountDL(this.props.populations, 'total_clients')}
                                </section>
                                <section id="experiment-ping-counts">
                                    <h5>Pings</h5>
                                    {this.getCountDL(this.props.populations, 'total_pings')}
                                </section>
                            </section>
                            <section id="experiment-authors">
                                <h4>Authors</h4>
                                <ul>
                                    {this.props.authors.map((contact, index) => (
                                        <li key={index}>
                                            <a href={`mailto:${contact.email}`}>
                                                <img src={this.getGravatarURL(contact.email)} alt={contact.name} />
                                                <span>{contact.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </section>
                        <section id="experiment-metrics">
                            <h3>Metrics</h3>
                            {this.state.activeMetrics.map(id => (
                                <MetricContainer
                                    key={id}
                                    experimentId={this.props.id}
                                    id={id}
                                />
                            ))}
                            <ReactPaginate
                                containerClassName='react-paginate'
                                activeClassName='active'

                                marginPagesDisplayed={1}
                                pageRangeDisplayed={4}

                                previousLabel='previous'
                                nextLabel='next'

                                initialPage={this.selectedPage - 1} // zero-based
                                pageCount={Math.ceil(this.props.metrics.length / this.metricsPerPage)}

                                disableInitialCallback={true}
                                onPageChange={e => {
                                    // zero-based
                                    const pageNumber = e.selected + 1;

                                    this.um.setQueryParameter('page', pageNumber);
                                    this.setState({ activeMetrics: this.getActiveMetrics(pageNumber) });
                                }}
                            />
                        </section>
                    </div>
                </article>
                {maybeMetricOverlay}
            </div>
        );
    }
}

export default withRouter(Experiment);
