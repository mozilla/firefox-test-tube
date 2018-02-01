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
        this.outliersSmallestProportion = 0.0001;

        this.populations = []; // Local (component) representation of the populations.
        const barChartThreshold = 20; // What number of x values should be used for bar chart determination.
        this.chartType = this._getChartType(props.type); // String of various chart types.

        // Create an internal population representation.
        // Adds completeData and trimmedData keys for use with props.showOutliers.
        props.unformattedData.populations.forEach((population, index) => {

            // Sort by x-axis value
            population.data.sort((a, b) => {
                return a.x - b.x;
            });

            const dataWithoutOutliers = this._removeOutliers(population.data);

            if (dataWithoutOutliers.length < barChartThreshold) {
                this.chartType = 'bar';
            }

            this.populations.push(population);
            this.populations[index].completeData = population.data;
            this.populations[index].trimmedData = dataWithoutOutliers;
        });
    }

    /**
     * Format the /metric/[id] JSON for use with chart.js scatter charts.
     */
    _formatLineData = data => {
        const formattedData = {
            datasets: [],
        };

        this.populations.forEach((population, index) => {
            const thisColor = this.colors[index];
            const resultData = [];

            // Data to send to view component based on show outliers toggle.
            const rawData = this.props.showOutliers ? population.completeData : population.trimmedData;

            // The API provides y values as numbers between 0 and 1, but we want
            // to display them as percentages.
            rawData.forEach((dataPoint, index) => {
                resultData.push({x: index, xActualValue: dataPoint.x, y: dataPoint.y * 100});
            });

            formattedData.datasets.push({
                label: population.name,
                data: resultData,

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
     * Format the /metric/[id] JSON for use with chart.js bar charts.
     */
    _formatBarData = data => {
        const formattedData = {
            datasets: [],
        };

        formattedData['labels'] = data.categories;

        if (!data.categories) {
            const dataToUse = this.props.showOutliers ? this.populations[0].completeData : this.populations[0].trimmedData;
            formattedData['labels'] = dataToUse.map(dp => dp.x);
        }

        console.log('labels:', formattedData['labels']);

        this.populations.forEach((population, index) => {
            const thisColor = this.colors[index];

            formattedData.datasets.push({
                label: population.name,
                data: this.props.showOutliers ? population.completeData : population.trimmedData,
                backgroundColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,
            });
        });

        return formattedData;
    }

    _getChartType(type) {
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

        if (lineTypes.includes(type)) { return 'line'; }
        if (barTypes.includes(type)) { return 'bar'; }
        return null;
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

    // TODO: Move formatData out of render() and use componentWillReceiveProps().
    // This should allow us to store the trimmed data for each chart and simply toggle between full/trimmed data.
    render() {
        let formatData;
        if (this.chartType === 'line') {
            formatData = this._formatLineData;
        } else if (this.chartType === 'bar') {
            formatData = this._formatBarData;
        }

        if (!formatData) {
            return <Error message={`Unsupported metric type: ${this.props.type}`} />;
        } else {
            return (
                <Chart
                    {...this.props}

                    chartType={this.chartType}
                    data={formatData(this.props.unformattedData)}
                />
            );
        }
    }
}
