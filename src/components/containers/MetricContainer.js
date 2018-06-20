import React from 'react';
import { connect } from 'react-refetch';

import Metric from '../views/Metric';
import Loading from '../views/Loading';
import Error from '../views/Error';


class MetricContainer extends React.Component {
    _buildNValues(data) {
        const ns = {};
        data.populations.forEach(p => {
            ns[p.name] = p.n;
        });
        return ns;
    }

    render() {
        const metricFetch = this.props.metricFetch;

        if (metricFetch.pending) {
            return <Loading />;
        } else if (metricFetch.rejected) {
            return <Error message={metricFetch.reason.message} />;
        } else if (metricFetch.fulfilled) {
            return (
                <Metric
                    id={metricFetch.value.id}
                    name={metricFetch.value.name}
                    unformattedData={metricFetch.value}
                    type={metricFetch.value.type}
                    nValues={this._buildNValues(metricFetch.value)}
                    description={metricFetch.value.description}
                    xUnit={metricFetch.value.units ? metricFetch.value.units.x : undefined}
                    yUnit={metricFetch.value.units ? metricFetch.value.units.y : undefined}
                    chartDataURL={metricFetch.meta.request.url}
                    showOutliers={this.props.showOutliers}
                    populationColors={this.props.populationColors}

                    // Force to "false" if undefined
                    asOverlay={this.props.asOverlay === true}
                />
            );
        }

        return (
            <Error showPageTitle={false} message="Error fetching metric" />
        );
    }
}

export default connect(props => ({
    metricFetch:`${process.env.REACT_APP_API_URL}/experiments/${props.experimentId}/metrics/${props.id}/`,
}))(MetricContainer);
