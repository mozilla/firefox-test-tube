import React from 'react';
import Plot from 'react-plotly.js';

import './css/RealTimeChart.css';


export default props => {
    return (
        <Plot
            data={props.data}
            layout={{
                width: 600,
                height: 250,
                yaxis: {showline: true},
                title: props.title
            }}
        />
    );
};
