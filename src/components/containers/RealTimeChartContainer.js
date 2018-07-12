import React from 'react';
import { connect } from 'react-refetch';
import Plot from 'react-plotly.js';

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
        const experimentFetch = this.props.experimentFetch;

        if (experimentFetch.pending) {
            return <Loading />;
        } else if (experimentFetch.rejected) {
            return <Error message={experimentFetch.reason.message} />;
        } else if (experimentFetch.fulfilled) {
            const data = [];
            let emptyDataFound = false;

            Object.keys(experimentFetch.value.population).forEach((cohort, i) => {
                if (experimentFetch.value.population[cohort].length) {
                    data.push({
                        x: experimentFetch.value.population[cohort].map(item => new Date(item.window)),
                        y: experimentFetch.value.population[cohort].map(item => item.count),
                        type: 'scatter',
                        mode: 'lines+points',
                        name: cohort,
                        line: {color: this.colors[i]}
                    });
                } else {
                    emptyDataFound = true;
                }
            });

            if (!emptyDataFound) {
                return (
                    <Plot
                        data={data}
                        layout={{width: 600, height: 250, yaxis: {showline: true}, title: 'Last 24h Population Size'}}
                    />
                );
            } else {
                return <Error message="Real-time population data returned was empty." />;
            }
        }
    }
}

export default connect(props => {
    return {
        experimentFetch: { url: `${process.env.REACT_APP_API_URL}/experiments/${props.slug}/populations/` },
    };
})(RealTimeChartContainer);
