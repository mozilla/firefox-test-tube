import React from 'react';
import Plot from 'react-plotly.js';

import Error from '../views/Error';
import Loading from '../views/Loading';

import './css/RealTimeChart.css';


export default props => {
    const dataFetch = props.dataFetch;

    if (dataFetch.pending) {
        return <Loading />;
    } else if (dataFetch.rejected) {
        return <Error message={dataFetch.reason.message} />;
    } else if (dataFetch.fulfilled) {
        const data = [];
        let emptyDataFound = false;

        Object.keys(dataFetch.value.population).forEach((cohort, i) => {
            if (dataFetch.value.population[cohort].length) {
                data.push({
                    x: dataFetch.value.population[cohort].map(item => new Date(item.window)),
                    y: dataFetch.value.population[cohort].map(item => item.count),
                    type: 'scatter',
                    mode: 'lines+points',
                    name: cohort,
                    line: {color: props.colors[i]}
                });
            } else {
                emptyDataFound = true;
            }
        });

        if (!emptyDataFound) {
            return (
                <Plot
                    data={data}
                    layout={{width: 600, height: 250, yaxis: {showline: true}, title: props.title}}
                />
            );
        } else {
            return <Error message="Real-time experiment data returned was empty." />;
        }
    }
};
