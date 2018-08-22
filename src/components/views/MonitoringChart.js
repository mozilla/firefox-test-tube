import React from 'react';
import Plot from 'react-plotly.js';

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
                    width: props.size.width,
                    height: props.size.height,
                    yaxis: {
                        showline: true,
                        title: 'Clients',
                        titlefont: fontStyles,
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
