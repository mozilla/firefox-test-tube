import React from 'react';
import { connect } from 'react-refetch';

import Metric from '../views/Metric';
import Loading from '../views/Loading';
import Error from '../views/Error';


/**
 * Format the /metric/[metricId] JSON for use with chart.js
 */
function formatData(populations) {
    const formattedData = {
        datasets: [],
    };

    populations.forEach(population => {
        // Sort by x-axis value
        population.data.sort((a, b) => {
            return a.x - b.x;
        });

        formattedData.datasets.push({
            label: population.name,
            data: population.data,
        });
    });

    return formattedData;
}

const MetricContainer = props => {
    const metricFetch = props.metricFetch;

    if (metricFetch.pending) {
        return <Loading />;
    } else if (metricFetch.rejected) {
        return <Error message={metricFetch.reason.message} />;
    } else if (metricFetch.fulfilled) {
        return (
            <Metric
                name={metricFetch.value.name}
                data={formatData(metricFetch.value.populations)}
            />
        );
    }

    return null;
}

export default connect(props => ({
    metricFetch: { url: `${process.env.REACT_APP_API_URL}/metrics/${props.metricId}`, refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL) },
}))(MetricContainer);
