import React from 'react';
import gravatar from 'gravatar';

import MetricContainer from '../containers/MetricContainer';
import Paginator from './Paginator';
import Switch from './Switch';
import SearchBox from './SearchBox';
import { getDistinctColors } from '../../lib/utils';
import MonitoringChartContainer from '../containers/MonitoringChartContainer';

import './css/Experiment.css';

export default class extends React.Component {
    constructor(props) {
        super(props);

        // Generate distinct population colors once per experiment and pass them
        // down to other components as needed. This has two advantages. First,
        // generating distinct colors can be resource-intensive. It's better to
        // do it only once. Second, generating colors here ensures that all
        // metrics in a given experiment use exactly the same colors, even if
        // some metrics have more populations than others.
        this.populationColors = getDistinctColors(Object.keys(props.populations).length);

        this.state = {
            showOutliers: props.showOutliers,
        };
    }

    getCountDL(populations, accessor) {
        const termGroups = [];
        let total = 0;
        let i = 0;

        for (const populationName in populations) {
            if (populations.hasOwnProperty(populationName)) {
                const color = `rgb(${this.populationColors[i][0]}, ${this.populationColors[i][1]}, ${this.populationColors[i++][2]})`;
                const count = populations[populationName][accessor];
                total += count;

                // Apparently wrapping a <dt> and <dd> pair in a <div> is valid. And
                // it helps with styling.
                // https://github.com/whatwg/html/pull/1945
                termGroups.push(
                    <div key={populationName} style={{ color }}>
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

    render() {
        let maybeMetricOverlay = null;
        if (this.props.selectedMetricId !== undefined && this.props.visibleMetricIds.includes(this.props.selectedMetricId)) {
            maybeMetricOverlay = (
              <MetricContainer
                  experimentId={this.props.id}
                  id={this.props.selectedMetricId}
                  asOverlay={true}
                  showOutliers={this.state.showOutliers}
                  populationColors={this.populationColors}
              />
            );
        }

        let maybeDescription = null;
        if (this.props.description) {
            maybeDescription = (
                <section id="experiment-description">
                    <h4>Description</h4>
                    <p>{this.props.description}</p>
                </section>
            );
        }

        let maybeAuthors = null;
        if (this.props.authors.length) {
            maybeAuthors = (
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
            );
        }

        let maybePaginator = null;
        if (!this.props.searchActive) {
            maybePaginator = (
                <Paginator
                    initialPage={this.props.initialPage - 1}
                    pageCount={Math.ceil(this.props.numItems / this.props.itemsPerPage)}
                    onPageChange={this.props.onPageChange}
                />
            );
        }

        return (
            <div>
                <article id="experiment">
                    <h2>{this.props.name || this.props.slug}</h2>
                    <section id="experiment-details">
                        <h3>Details</h3>
                        {maybeDescription}
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
                        {maybeAuthors}
                    </section>
                    <div className="monitoring-charts">
                        <MonitoringChartContainer
                            colors={this.populationColors}
                            endpoint={`${process.env.REACT_APP_API_URL}/experiments/${this.props.slug}/populations/`}
                            title="Populations"
                            fullWidth={true}
                        />
                        <MonitoringChartContainer
                            colors={this.populationColors}
                            endpoint={`${process.env.REACT_APP_API_URL}/experiments/${this.props.slug}/enrolls/`}
                            title="Enrollments"
                        />
                        <MonitoringChartContainer
                            colors={this.populationColors}
                            endpoint={`${process.env.REACT_APP_API_URL}/experiments/${this.props.slug}/unenrolls/`}
                            title="Unenrollments"
                        />
                        <MonitoringChartContainer
                            colors={this.populationColors}
                            endpoint={`${process.env.REACT_APP_API_URL}/experiments/${this.props.slug}/realtime-enrolls/`}
                            title="Enrollments (5min)"
                            refreshMins={5}
                        />
                        <MonitoringChartContainer
                            colors={this.populationColors}
                            endpoint={`${process.env.REACT_APP_API_URL}/experiments/${this.props.slug}/realtime-unenrolls/`}
                            title="Unenrollments (5min)"
                            refreshMins={5}
                        />
                    </div>
                    <aside id="experiment-options">
                        <h3>Options</h3>
                        <SearchBox onKeyUp={this.props.onSearch} />
                        <Switch
                            active={this.state.showOutliers}
                            label="show outliers"
                            onClick={evt => {
                                this.setState({showOutliers: !this.state.showOutliers});
                            }}
                        />
                    </aside>
                    <section id="experiment-metrics">
                        <h3>Metrics</h3>
                        {this.props.visibleMetricIds.map(id => (
                            <MetricContainer
                                key={id}
                                experimentId={this.props.id}
                                id={id}
                                showOutliers={this.state.showOutliers}
                                populationColors={this.populationColors}
                            />
                        ))}
                    </section>
                    {maybePaginator}
                </article>
                {maybeMetricOverlay}
            </div>
        );
    }
}
