import React from 'react';

import { Scatter as ScatterChart } from 'react-chartjs-2';

import './css/Metric.css';


export default props => {
    return (
        <div className="metric">
            <h3 className="metric-name">{props.name}</h3>
            <p className="metric-description">{props.description}</p>
            <ScatterChart
                data={props.data}
                height={250}
                width={350}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: label => label + props.yUnit,
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: props.xUnit,
                            },
                        }],
                    },
                    tooltips: {
                        callbacks: {
                            label: tt => `(${tt.xLabel.toLocaleString('en-US')} ${props.xUnit}, ${tt.yLabel}${props.yUnit})`,
                        },
                    },
                }}
            />
        </div>
    );
};
