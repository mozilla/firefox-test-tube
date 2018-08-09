import React from 'react';
import { connect } from 'react-refetch';

import RealTimeChart from '../views/RealTimeChart';
import Error from '../views/Error';
import Loading from '../views/Loading';


class RealTimeChartContainer extends React.Component {
    constructor(props) {
        super(props);

        this.colors = props.colors.map(color => {
            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        });
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
                Object.keys(dataFetch.value.population).forEach((cohort, i) => {
                    data.push({
                        x: dataFetch.value.population[cohort].map(item => new Date(item.window)),
                        y: dataFetch.value.population[cohort].map(item => item.count),
                        type: 'scatter',
                        mode: 'lines+points',
                        name: cohort,
                        line: {color: this.colors[i]}
                    });
                });
                return (
                    <RealTimeChart
                        title={this.props.title}
                        colors={this.colors}
                        data={data}
                    />
                );
            } else {
                return <Error message="Real-time experiment data returned was empty." />;
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
})(RealTimeChartContainer);
