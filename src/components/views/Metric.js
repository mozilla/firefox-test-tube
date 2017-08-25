import React from 'react';

import { Scatter as ScatterChart, Bar as BarChart } from 'react-chartjs-2';

import './css/Metric.css';


export default props => {
    const width = 500;
    const height = 350;

    let chart = null;
    if (props.type === 'line') {
        chart = (
            <ScatterChart
                data={props.data}
                width={width}
                height={height}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: (${tt.xLabel.toLocaleString('en-US')} ${props.xUnit}, ${tt.yLabel}${props.yUnit})`,
                        },
                    },
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
                            ticks: {
                                callback: label => label.toLocaleString('en-US'),
                            },
                        }],
                    },
                }}
            />
        );
    } else if (props.type === 'bar') {
        chart = (
            <BarChart
                data={props.data}
                width={width}
                height={height}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: ${tt.yLabel.toLocaleString('en-US')}`
                        },
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: props.xUnit,
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                callback: label => label.toLocaleString('en-US'),
                            },
                            scaleLabel: {
                                display: true,
                                labelString: props.yUnit,
                            },
                        }],
                    },
                }}
            />
        );
    }

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
            {chart}
        </section>
    );
};
