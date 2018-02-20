import React from 'react';

import Chart from '../views/Chart';
import Error from '../views/Error';


export default class extends React.Component {
    constructor(props) {
        super(props);

        // See https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
        this.colors = [
            { r: 74, g: 144, b: 226 },
            { r: 230, g: 25, b: 75 },
            { r: 60, g: 180, b: 75 },
            { r: 255, g: 255, b: 25 },
            { r: 245, g: 130, b: 49 },
            { r: 145, g: 30, b: 180 },
            { r: 70, g: 240, b: 240 },
            { r: 250, g: 190, b: 190 },
        ];

        // Show outliers toggle constants.
        this.outliersThreshold = 10;
        this.outliersSmallestProportion = 0.01;

        // The minimum number of data points that the biggest population of a
        // "line type" metric must have in order for it to be rendered as a line
        // chart. If the biggest population has fewer than this many data
        // points, it will be rendered as a bar chart instead.
        this.minLinePoints = 21;
    }

    /**
     * Return the size of the biggest population in a dataset.
     */
    _biggestPopulationSize(data) {
        return Math.max(...data.populations.map(p => p.data.length));
    }

    /**
     * Format metric JSON for use with Chart.js bar charts.
     *
     * @param  data  The raw JSON from /metric/[id]
     */
    _formatLineData = data => {
        const formattedData = {
            datasets: [],
        };

        data.populations.forEach((population, index) => {
            const thisColor = this.colors[index];
            const resultData = [];

            // Sort by x-axis value
            population.data.sort((a, b) => {
                return a.x - b.x;
            });

            // The API provides y values as numbers between 0 and 1, but we want
            // to display them as percentages.
            population.data.forEach((dataPoint, index) => {
                resultData.push({x: index, xActualValue: dataPoint.x, y: dataPoint.y * 100});
            });

            formattedData.datasets.push({
                label: population.name,
                data: this.props.showOutliers ? resultData : this._removeOutliers(resultData),

                // What d3 calls curveStepBefore
                steppedLine: 'before',

                // Don't color the area below the chart
                fill: false,

                // Line color
                borderColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,

                // Color of this dataset's box in the legend and also the dots
                // in the corresponding line
                backgroundColor: `rgb(${thisColor.r}, ${thisColor.g}, ${thisColor.b})`,

                // Don't show a border for this dataset's box in the legend
                borderWidth: 0,
            });
        });

        return formattedData;
    }

    /**
     * Format metric JSON for use with Chart.js bar charts.
     *
     * @param  data        The raw JSON from /metric/[id]
     * @param  isLineType  True if this metric is technically a "line type," but
     *                     it needs to be rendered as a bar chart anyway. The
     *                     JSON of "line type" metrics is formatted differently
     *                     and need to account for that here.
     */
    _formatBarData = (data, isLineType = false) => {
        const formattedData = {
            datasets: [],
        };

        if (isLineType || !data.categories) {
            formattedData['labels'] = data.populations[0].data.map(dp => dp.x);
        } else {
            formattedData['labels'] = data.categories;
        }

        data.populations.forEach((population, index) => {
            const thisColor = this.colors[index];

            const newDataset = {
                label: population.name,
                backgroundColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,
            };

            if (isLineType) {
                newDataset.data = population.data.map(dp => dp.y);
            } else {
                newDataset.data = population.data;
            }

            formattedData.datasets.push(newDataset);
        });

        return formattedData;
    }

    _getMetricType(type) {
        const lineTypes = [
            'CountHistogram',
            'EnumeratedHistogram',
            'ExponentialHistogram',
            'LinearHistogram',
            'StringScalar',
            'UintScalar',
        ];

        const barTypes = [
            'BooleanHistogram',
            'BooleanScalar',
            'FlagHistogram',
        ];

        if (lineTypes.includes(type)) return 'line';
        if (barTypes.includes(type)) return 'bar';
    }

    // Return an array with buckets with data less than the
    // `outliersSmallestProportion` trimmed from the right.
    _removeOutliers(data) {
        if (data.length <= this.outliersThreshold) return data;

        let indexLast = data.length - 1;
        for (; indexLast >= 0; indexLast--) {
          if (data[indexLast]['y'] > this.outliersSmallestProportion) {
            break;
          }
        }

        // Add 1 because the second paramater to Array.slice is not inclusive.
        return data.slice(0, indexLast + 1);
    }

    // TODO: Move dataFormattingMethod out of render() and use componentWillReceiveProps().
    // This should allow us to store the trimmed data for each chart and simply toggle between full/trimmed data.
    render() {
        let dataFormattingMethod;
        let metricType = this._getMetricType(this.props.type);
        let chartType = metricType;

        if (metricType === 'bar') {
            dataFormattingMethod = this._formatBarData;
        } else if (metricType === 'line') {
            if (this._biggestPopulationSize(this.props.unformattedData) >= this.minLinePoints) {
                dataFormattingMethod = this._formatLineData;
            } else {
                dataFormattingMethod = data => this._formatBarData(data, true);
                chartType = 'bar';
            }
        }

        if (!dataFormattingMethod) {
            return <Error message={`Unsupported metric type: ${this.props.type}`} />;
        } else {
            return (
                <Chart
                    {...this.props}

                    chartType={chartType}
                    data={dataFormattingMethod(this.props.unformattedData)}
                />
            );
        }
    }
}
