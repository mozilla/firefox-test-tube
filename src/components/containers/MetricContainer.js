import React from 'react';
import { connect } from 'react-refetch';

import Metric from '../views/Metric';
import Loading from '../views/Loading';
import Error from '../views/Error';


class MetricContainer extends React.Component {
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

    _buildNValues(data) {
        const ns = {};
        data.populations.forEach(p => {
            ns[p.name] = p.n;
        });
        return ns;
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

            formattedData.datasets.push({
                label: population.name,
                data: population.data,
                backgroundColor: `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, .5)`,
            })
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
            })
        });

        return formattedData;
    }

    render() {
        const metricFetch = this.props.metricFetch;

        if (metricFetch.pending) {
            return <Loading />;
        } else if (metricFetch.rejected) {
            return <Error message={metricFetch.reason.message} />;
        } else if (metricFetch.fulfilled) {
            let formatData;
            if (this._isLineType(metricFetch.value.type)) {
                formatData = this._formatLineData;
            } else if (this._isBarType('bar')) {
                formatData = this._formatBarData;
            }

            if (!formatData) {
                return <Error message="Metric type unsupported" />;
            } else {
                return (
                    <Metric
                        id={metricFetch.value.id}
                        name={metricFetch.value.name}
                        nValues={this._buildNValues(metricFetch.value)}
                        description={metricFetch.value.description}
                        data={formatData(metricFetch.value)}
                        xUnit={metricFetch.value.units ? metricFetch.value.units.x : undefined}
                        yUnit={metricFetch.value.units ? metricFetch.value.units.y : undefined}
                        chartDataURL={metricFetch.meta.request.url}

                        type={metricFetch.value.type}
                        isLineType={this._isLineType}
                        isBarType={this._isBarType}

                        // Force to "false" if undefined
                        asOverlay={this.props.asOverlay === true}
                    />
                );
            }
        }

        return (
            <Error showPageTitle={false} message="Error fetching metric" />
        );
    }
}

export default connect(props => ({
    metricFetch: { url: `${process.env.REACT_APP_API_URL}/experiments/${props.experimentId}/metrics/${props.id}/`, refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL) },
}))(MetricContainer);
