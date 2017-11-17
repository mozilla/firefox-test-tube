import React from 'react';
import { Scatter as ScatterChart, Bar as BarChart } from 'react-chartjs-2';


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
                            label: (tt, data) => `${data.datasets[tt.datasetIndex].label}: (${tt.xLabel.toLocaleString('en-US', { minimumSignificantDigits: significantDigits })}${xUnit ? ' ' : ''}${xUnit}, ${tt.yLabel.toPrecision(significantDigits)}%)`,
                        },
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: label => label + '%',
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
