import React from 'react';
import { Scatter as ScatterChart, Bar as BarChart } from 'react-chartjs-2';
import Chart from 'chart.js';
import Ticks from 'chart.js/src/core/core.ticks';

import OrdinalScale from '../../lib/OrdinalScale';


const defaultConfig = {
    position: 'bottom',
    ticks: {
        callback: Ticks.formatters.linear
    }
};

Chart.scaleService.registerScaleType('ordinal', OrdinalScale, defaultConfig);

export default props => {
    const chartWidth = props.asOverlay ? null : 500;
    const chartHeight = props.asOverlay ? null : 350;

    const xUnit = props.xUnit ? props.xUnit : '';
    const yUnit = props.yUnit ? props.yUnit : '';

    const significantDigits = 5;

    let chart = null;
    if (props.isLineType(props.type)) {
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
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: (x: ${tt.xLabel.toLocaleString('en-US', { minimumSignificantDigits: significantDigits })}${xUnit ? ' ' : ''}${xUnit}, y: ${tt.yLabel.toPrecision(significantDigits)}%)`,
                        },
                    },
                    elements: {
                        point: {
                            // Hide dots by default but show them upon hover
                            radius: 0,
                            hitRadius: 10,
                        },
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: label => label + '%',
                            },
                        }],
                        xAxes: [{
                            type: 'ordinal',
                            scaleLabel: {
                                display: true,
                                labelString: xUnit,
                            },
                            ticks: {
                                callback: (val, i, vals) => {
                                    // Storing this in a var for readability.
                                    // We use the first line's X values as indices to set the ticks
                                    // which would be a bad idea if they were wildly different.
                                    // Our use case allows for this.
                                    const result = props.data.datasets[0].data[val];
                                    return result ? result.xVal : '';
                                }
                            },
                        }],
                    },
                }}
            />
        );
    } else if (props.isBarType(props.type)) {
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
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: ${tt.yLabel.toLocaleString('en-US', { minimumSignificantDigits: significantDigits })}`
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

    return chart;
};
