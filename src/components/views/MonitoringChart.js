import React from 'react';
import Plot from 'react-plotly.js';
import { format } from 'd3-format';

import './css/MonitoringChart.css';


export default props => {
    const classes = ['monitoring-chart'];
    if (props.fullWidth) classes.push('large');
    const fontStyles = {size: 11};

    return (
        <div className={classes.join(' ')}>
            <Plot
                data={props.data}
                layout={{
                    width: props.fullWidth ? 1200 : 600,
                    height: props.fullWidth ? 350 : 250,
                    yaxis: {
                        showline: true,
                        title: 'Clients',
                        titlefont: fontStyles,
                        format: format(',d'),
                        tickfont: fontStyles
                    },
                    xaxis: {
                        tickfont: fontStyles
                    },
                    title: props.title
                }}
            />
        </div>
    );
};
