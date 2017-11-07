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

        this._formatLineData = this._formatLineData.bind(this);
        this._formatBarData = this._formatBarData.bind(this);
    }

    /**
     * Format the /metric/[id] JSON for use with chart.js
     */
    _formatLineData(data) {
        const formattedData = {
            datasets: [],
        };

        data.populations.forEach((population, index) => {
            const thisColor = this.colors[index];

            // Sort by x-axis value
            population.data.sort((a, b) => {
                return a.x - b.x;
            });

            // The API provides y values as numbers between 0 and 1, but we want
            // to display them as percentages.
            population.data.map(dataPoint => {
                dataPoint.y = dataPoint.y * 100;
                return dataPoint;
            });

            formattedData.datasets.push({
                label: population.name,
                data: population.data,

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

    _formatBarData(data) {
        const formattedData = {
            datasets: [],
        };

        formattedData['labels'] = data.categories;

        data.populations.forEach((population, index) => {
            const thisColor = this.colors[index];

            formattedData.datasets.push({
                label: population.name,
                data: population.data,
                backgroundColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,
            });
        });

        return formattedData;
    }

    _isLineType(type) {
        const lineTypes = [
            'CountHistogram',
            'UintScalar',
            'StringScalar',
            'LinearHistogram',
            'EnumeratedHistogram',
            'ExponentialHistogram',
        ];
        return lineTypes.includes(type);
    }

    _isBarType(type) {
        const barTypes = [
            'BooleanHistogram',
            'BooleanScalar',
            'FlagHistogram',
        ];
        return barTypes.includes(type);
    }

    render() {
        let formatData;
        if (this._isLineType(this.props.type)) {
            formatData = this._formatLineData;
        } else if (this._isBarType(this.props.type)) {
            formatData = this._formatBarData;
        }

        if (!formatData) {
            return <Error message={`Unsupported metric type: ${this.props.type}`} />;
        } else {
            return (
                <Chart
                    {...this.props}

                    isLineType={this._isLineType}
                    isBarType={this._isBarType}
                    data={formatData(this.props.unformattedData)}
                />
            );
        }
    }
}
