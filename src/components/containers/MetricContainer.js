import React from 'react';
import { connect } from 'react-refetch';

import Metric from '../views/Metric';
import Loading from '../views/Loading';
import Error from '../views/Error';


/**
 * Format the /metric/[metricId] JSON for use with chart.js
 */
function formatData(populations) {
    // See https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
    const colors = [
        { r: 74, g: 144, b: 226 },
        { r: 230, g: 25, b: 75 },
        { r: 60, g: 180, b: 75 },
        { r: 255, g: 255, b: 25 },
        { r: 245, g: 130, b: 49 },
        { r: 145, g: 30, b: 180 },
        { r: 70, g: 240, b: 240 },
        { r: 250, g: 190, b: 190 },
    ];

    const formattedData = {
        datasets: [],
    };

    populations.forEach((population, index) => {
        const thisColor = colors[index];

        // Sort by x-axis value
        population.data.sort((a, b) => {
            return a.x - b.x;
        });

        formattedData.datasets.push({
            label: population.name,
            data: population.data,
            backgroundColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,
        })
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
                description={metricFetch.value.description}
                data={formatData(metricFetch.value.populations)}
                xUnit={metricFetch.value.units.x}
                yUnit={metricFetch.value.units.y}
            />
        );
    }

    return null;
}

export default connect(props => ({
    metricFetch: { url: `${process.env.REACT_APP_API_URL}/metrics/${props.metricId}`, refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL) },
}))(MetricContainer);
