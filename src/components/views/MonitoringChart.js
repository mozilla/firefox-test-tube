import React from 'react';
import Plot from 'react-plotly.js';

import './css/MonitoringChart.css';


export default props => {
    const classes = ['monitoring-chart'];
    if (props.fullWidth) classes.push('large');

    return (
        <div className={classes.join(' ')}>
            <Plot
                data={props.data}
                layout={{
                    width: props.fullWidth ? 1200 : 600,
                    height: props.fullWidth ? 350 : 250,
                    yaxis: {showline: true},
                    title: props.title
                }}
            />
        </div>
    );
};
