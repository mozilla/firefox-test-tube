import React from 'react';
import { connect } from 'react-refetch';

import MonitoringChart from '../views/MonitoringChart';
import Error from '../views/Error';
import Loading from '../views/Loading';
import ChartTotals from '../views/ChartTotals';
import { prependControlToPopulations } from '../../lib/utils';


class MonitoringChartContainer extends React.Component {
    constructor(props) {
        super(props);
        this.colors = [];

        if (props.colors) {
            this.colors = props.colors.map(color => {
                return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            });
        }

        this.populationTotals = {};
    }

    render() {
        const dataFetch = this.props.dataFetch;

        if (dataFetch.pending) {
            return <Loading />;
        } else if (dataFetch.rejected) {
            return <Error message={dataFetch.reason.message} />;
        } else if (dataFetch.fulfilled) {
            const data = [];

            // Do any of the population cohorts contain empty data?
            const emptyDataFound = Object.keys(dataFetch.value.population).some(cohort => {
                return dataFetch.value.population[cohort].length === 0;
            });

            if (!emptyDataFound) {
                const populations = prependControlToPopulations(dataFetch.value.population);
                let grandTotal = 0;

                Object.keys(populations).forEach((cohort, i) => {
                    const dataLine = {
                        x: populations[cohort].map(item => new Date(item.window)),
                        y: populations[cohort].map((item, index) => {

                            // We'll hijack this iterator to count the chart totals.
                            // This only applies to non-realtime charts.
                            if (!this.props.refreshMins) { // Not a realtime chart.
                                // If this is a new iteration start the total with item.count.
                                if (index === 0) {
                                    this.populationTotals[cohort] = item.count;
                                } else { // Add item.count to existing total.
                                    this.populationTotals[cohort] += item.count;
                                }
                            }

                            return item.count;
                        }),
                        type: 'scatter',
                        mode: 'lines+points',
                        name: cohort
                    };

                    // Add up the totals of every cohort.
                    grandTotal += this.populationTotals[cohort];

                    if (this.colors.length) dataLine['line'] = {color: this.colors[i]};
                    data.push(dataLine);
                });

                return (
                    <div className="monitoring-chart-container">
                        <MonitoringChart
                            title={this.props.title}
                            data={data}
                            fullWidth={this.props.fullWidth}
                            size={this.props.size}
                        />
                        <ChartTotals
                            totals={this.populationTotals}
                            grandTotal={grandTotal}
                            fullWidth={this.props.fullWidth}
                            colors={this.colors}
                        />
                    </div>
                );
            } else {
                return <Error message="Experiment monitoring chart contains empty data." />;
            }
        }
    }
}

export default connect(props => {
    const fetchParams = {
        url: props.endpoint
    };

    // Refresh the component after refreshMins if provided.
    if (props.refreshMins) fetchParams.refreshInterval = props.refreshMins * 60 * 1000;

    return {
        dataFetch: fetchParams,
    };
})(MonitoringChartContainer);
