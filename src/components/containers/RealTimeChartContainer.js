import React from 'react';
import { connect } from 'react-refetch';
import MetricsGraphics from 'react-metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';

import Error from '../views/Error';
import Loading from '../views/Loading';
import * as d3Shape from 'd3-shape';


class RealTimeChartContainer extends React.Component {
    constructor(props) {
        super(props);

        this.colors = props.colors.map(color => {
            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        });
    }

    render() {
        const experimentFetch = this.props.experimentFetch;
        const data = [];

        Object.keys(experimentFetch.value.population).forEach(cohort => {
            data.push(experimentFetch.value.population[cohort].map(item => {
                return {window: new Date(item.window), count: item.count};
            }));
        });


        if (experimentFetch.pending) {
            return <Loading />;
        } else if (experimentFetch.rejected) {
            return <Error message={experimentFetch.reason.message} />;
        } else if (experimentFetch.fulfilled) {
            return (
                <MetricsGraphics
                    data={data}
                    width={600}
                    height={300}
                    x_accessor="window"
                    y_accessor="count"
                    interpolate={d3Shape.curveLinear}
                    colors={this.colors}
                />
            );
        }
    }
}

export default connect(props => {
    return {
        experimentFetch: { url: `${process.env.REACT_APP_API_URL}/experiments/${props.slug}/populations/` },
    };
})(RealTimeChartContainer);
