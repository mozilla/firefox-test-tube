import React from 'react';
import { Scatter as ScatterChart, Bar as BarChart, Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.pluginService.register(annotationPlugin);

/**
 * We use ordinal x-axis labeling for all line charts. The data points are
 * positioned as if x values are ordinal, but the x-axis is labeled with the
 * actual values instead.
 *
 * See issue #47 for more info.
 */
export default props => {
    const chartWidth = props.asOverlay ? null : 500;
    const chartHeight = props.asOverlay ? null : 350;

    const xUnit = props.xUnit ? props.xUnit : '';
    const yUnit = props.yUnit ? props.yUnit : '';

    const significantDigits = 5;

    function ordinalToActualValue(ordinal, datasetIndex = 0) {
        const currentDataPoint = props.data.datasets[datasetIndex].data.find(e => e.x === Number(ordinal));
        if (currentDataPoint) {
            return currentDataPoint.xActualValue;
        }
    }

    let chart = null;
    if (props.chartType === 'line') {
        chart = (
            <ScatterChart
                data={props.data}
                width={chartWidth}
                height={chartHeight}
                options={{
                    animation: false,
                    maintainAspectRatio: false,
                    responsive: props.asOverlay,
                    showLines: true,
                    legend: {
                        display: false // We'll be using our own custom legend outside of canvas.
                    },
                    tooltips: {
                        callbacks: {
                            label: (tt, data) => {
                                const xValue = ordinalToActualValue(tt.xLabel, tt.datasetIndex);
                                return `${data.datasets[tt.datasetIndex].label}: (x: ${xValue.toLocaleString('en-US', { minimumSignificantDigits: significantDigits })}${xUnit ? ' ' : ''}${xUnit}, y: ${tt.yLabel.toPrecision(significantDigits)}%)`;
                            }
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
                            scaleLabel: {
                                display: true,
                                labelString: xUnit,
                            },
                            ticks: {
                                stepSize: 1,
                                maxTicksLimit: 10,
                                callback: xLabel => {
                                    const actualValue = ordinalToActualValue(xLabel);
                                    if (actualValue) {
                                        return actualValue.toLocaleString('en-US');
                                    }
                                }
                            },
                        }],
                    },
                    annotation: {
                        annotations: [
                            {
                                drawTime: 'afterDraw', // overrides annotation.drawTime if set
                                //id: 'a-line-1', // optional
                                type: 'line',
                                mode: 'horizontal',
                                scaleID: 'y-axis-0',
                                value: 10,
                                borderColor: 'red',
                                borderWidth: 2
                            },
                            {
                                drawTime: 'afterDraw', // overrides annotation.drawTime if set
                                //id: 'a-line-1', // optional
                                type: 'line',
                                mode: 'vertical',
                                scaleID: 'x-axis-0',
                                value: 25,
                                borderColor: 'black',
                                borderWidth: 2
                            }
                        ]
                    }
                }}
            />
        );
    } else if (props.chartType === 'bar') {
        chart = (
            <BarChart
                data={props.data}
                width={chartWidth}
                height={chartHeight}
                options={{
                    animation: false,
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
