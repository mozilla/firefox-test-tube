import React from 'react';

import { Scatter as ScatterChart } from 'react-chartjs-2';

import './css/Metric.css';


export default props => {
    return (
        <section className="metric">
            <h4 className="metric-name">{props.name}</h4>
            <section id="metric-details">
                <h5>Details</h5>
                <dl>
                  <dt>n</dt>
                  <dd>{props.n.toLocaleString('en-US')}</dd>
                </dl>
                <p className="metric-description">{props.description}</p>
            </section>
            <ScatterChart
                data={props.data}
                height={350}
                width={500}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: label => label + '%',
                                min: 0,
                                max: 100,
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
        </section>
    );
};
