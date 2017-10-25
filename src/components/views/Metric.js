import React from 'react';
import { withRouter } from 'react-router-dom';
import { Scatter as ScatterChart, Bar as BarChart } from 'react-chartjs-2';
import { Icon } from 'react-fa';

import OverlayContainer from '../containers/OverlayContainer';
import URLManager from '../../lib/URLManager';

import './css/Metric.css';


export default withRouter(props => {
    const um = new URLManager(props.location, props.history);

    const chartWidth = props.asOverlay ? null : 500;
    const chartHeight = props.asOverlay ? null : 350;

    const xUnit = props.xUnit ? props.xUnit : '';
    const yUnit = props.yUnit ? props.yUnit : '';

    function buildNValuesDL(nValues) {
        let pairs = [];

        for (let populationName in nValues) {
            if (nValues.hasOwnProperty(populationName)) {

                pairs.push(
                    <div key={populationName}>
                        <dt>{populationName}</dt>
                        <dd>{nValues[populationName].toLocaleString('en-US')}</dd>
                    </div>
                );

            }
        }

        return <dl>{pairs}</dl>;
    }

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
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: (${tt.xLabel.toLocaleString('en-US')} ${xUnit}, ${tt.yLabel}%)`,
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
                                labelString: xUnit,
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
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: ${tt.yLabel.toLocaleString('en-US')}`
                        },
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: xUnit,
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                callback: label => label.toLocaleString('en-US'),
                            },
                            scaleLabel: {
                                display: true,
                                labelString: yUnit,
                            },
                        }],
                    },
                }}
            />
        );
    }

    if (props.asOverlay) {
        return (
            <OverlayContainer title={props.name} onClose={() => um.removeQueryParameter('chart')}>
                {chart}
            </OverlayContainer>
        );
    } else {
        return (
            <section className="metric">
                <div className="name-and-fullscreen-button">
                    <h4 className="metric-name">{props.name}</h4>
                    <Icon className="fullscreen-button" name="arrows-alt" onClick={() => um.setQueryParameter('chart', props.id)} />
                </div>
                <section id="metric-details">
                    <h5>Details</h5>
                    <div className="n-values">
                        <h6>n</h6>
                        {buildNValuesDL(props.nValues)}
                    </div>
                    <a className="get-json" href={props.chartDataURL}>Get JSON</a>
                    <p className="metric-description">{props.description}</p>
                </section>
                {chart}
            </section>
        );
    }
});
