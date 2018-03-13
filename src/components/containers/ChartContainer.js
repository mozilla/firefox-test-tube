import React from 'react';

import Chart from '../views/Chart';
import Error from '../views/Error';
import ChartColors from './ChartColors';


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.chartType = this._getChartType(props.type);

        if (this.chartType !== 'unsupported') {
            // Outlier constants
            this.outliersThreshold = 10;
            this.outliersSmallestProportion = 0.01;

            this.dataPack = this._createDataPack(props.unformattedData, this.chartType);
        }
    }

    /**
     * Return a "data pack". A data pack is an object of data formatted for use
     * with Chart.js, organized by whether or not the data has been trimmed to
     * remove outliers.
     *
     * Example output:
     *
     *     {
     *         all: [...] // Formatted data with all data points present
     *         trimmed: [...] // Formatted data with outlying data points removed
     *     }
     *
     * If a "line type" metric has too few data points, it will be formatted for
     * use as a bar chart instead. this.chartType will also be changed
     * accordingly.
     */
    _createDataPack(data, chartType) {
        const dataPack = {};

        // The minimum number of data points that the biggest population of a
        // "line type" metric must have in order for it to be rendered as a line
        // chart. If the biggest population has fewer than this many data
        // points, it will be rendered as a bar chart instead.
        const minLinePoints = 21;

        /**
         * Quick summary:
         *
         * "Bar-type" metrics will always be presented as bar charts.
         *
         * If a "line-type" metric has <= this.minLinePoints data points before
         * outliers are removed, it will be presented as a bar chart when
         * outliers are shown and when outliers are hidden.
         *
         * If a "line-type" metric has > this.minLinePoints data points before
         * before outliers are removed, it will be presented as a line chart
         * when outliers are shown and when outliers are hidden. This means that
         * it will be presented as a line chart when outliers are hidden even if
         * there are less than this.minLinePoints data points when outliers are
         * hidden. This is better than the alternatives. Switching between a
         * line chart and a bar chart depending on the state of the outliers
         * setting would be confusing. Presenting it as a bar chart and
         * showing/hiding bars depending on the state of the outliers setting
         * would also be strange.
         */
        if (chartType === 'bar') {
            dataPack.all = this._formatBarData(data);
        } else if (chartType === 'line') {
            if (this._biggestPopulationSize(data) >= minLinePoints) {
                dataPack.all = this._formatLineData(data, true);

                if (this._biggestPopulationSize(data) >= this.outliersThreshold) {
                    dataPack.trimmed = this._formatLineData(data, false);
                }
            } else {
                dataPack.all = this._formatBarData(data, true);
                this.chartType = 'bar';
            }
        }

        return dataPack;
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
    _formatLineData = (data, includeOutliers) => {
        const formattedData = {
            datasets: [],
        };

        data.populations.forEach((population, index) => {
            const thisColor = ChartColors[index];
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
                data: includeOutliers ? resultData : this._removeOutliers(resultData),

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
     *                     and we need to account for that here.
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
            const thisColor = ChartColors[index];

            const newDataset = {
                label: population.name,
                backgroundColor: `rgb(${thisColor.r}, ${thisColor.g}, ${thisColor.b})`,
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

    _getChartType(metricType) {
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

        if (lineTypes.includes(metricType)) {
            return 'line';
        } else if (barTypes.includes(metricType)) {
            return 'bar';
        } else {
            return 'unsupported';
        }
    }

    // Return an array with buckets with data less than the
    // `outliersSmallestProportion` trimmed from the right.
    _removeOutliers(data) {
        let indexLast = data.length - 1;
        for (; indexLast >= 0; indexLast--) {
          if (data[indexLast]['y'] > this.outliersSmallestProportion) {
            break;
          }
        }

        // Add 1 because the second paramater to Array.slice is not inclusive.
        return data.slice(0, indexLast + 1);
    }

    render() {
        if (this.chartType === 'unsupported') {
            return <Error message={`Unsupported metric type: ${this.props.type}`} showPageTitle={false} />;
        } else {
            let dataToShow;
            if (this.dataPack.trimmed && this.props.showOutliers === false) {
                dataToShow = this.dataPack.trimmed;
            } else {
                dataToShow = this.dataPack.all;
            }

            // Temporary workaround for this issue:
            // https://github.com/jerairrest/react-chartjs-2/issues/250
            dataToShow = JSON.parse(JSON.stringify(dataToShow));

            return (
                <Chart
                    {...this.props}

                    chartType={this.chartType}
                    data={dataToShow}
                />
            );
        }
    }
}
