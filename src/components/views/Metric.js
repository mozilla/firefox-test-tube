import React from 'react';
import { Link } from 'react-router-dom';
import { Scatter as ScatterChart, Bar as BarChart } from 'react-chartjs-2';
import { Icon } from 'react-fa';

import Overlay from './Overlay';

import './css/Metric.css';


export default props => {
    const chartWidth = props.asOverlay ? null : 500;
    const chartHeight = props.asOverlay ? null : 350;
    const chartAnimationDuration = props.asOverlay ? 0 : 1000;

    let chart = null;
    if (props.type === 'line') {
        chart = (
            <ScatterChart
                data={props.data}
                width={chartWidth}
                height={chartHeight}
                options={{
                    maintainAspectRatio: false,
                    responsive: props.asOverlay,
                    showLines: true,
                    animation: {
                        duration: chartAnimationDuration,
                    },
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: (${tt.xLabel.toLocaleString('en-US')} ${props.xUnit}, ${tt.yLabel}%)`,
                        },
                    },
                    elements: {
                        line: {
                            // Don't curve the line between data points
                            tension: 0,
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
                width={chartWidth}
                height={chartHeight}
                options={{
                    maintainAspectRatio: false,
                    responsive: props.asOverlay,
                    animation: {
                        duration: chartAnimationDuration,
                    },
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

    if (props.asOverlay) {
        return (
            <Overlay title={props.name} closeTo={`/experiment/${props.experimentId}/`}>
                {chart}
            </Overlay>
        );
    } else {
        return (
            <section className="metric">
                <div className="name-and-fullscreen-button">
                    <h4 className="metric-name">{props.name}</h4>
                    <Link className="fullscreen-button" to={`chart/${props.metricId}/`}><Icon name="arrows-alt" /></Link>
                </div>
                <section id="metric-details">
                    <h5>Details</h5>
                    <dl>
                      <dt>n</dt>
                      <dd>{props.n.toLocaleString('en-US')}</dd>
                    </dl>
                    <a className="get-json" href={props.chartDataURL}>Get JSON</a>
                    <p className="metric-description">{props.description}</p>
                </section>
                {chart}
            </section>
        );
    }
};
