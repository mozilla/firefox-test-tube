import React from 'react';
import { connect } from 'react-refetch';

import RealTimeChart from '../views/RealTimeChart';


class RealTimeChartContainer extends React.Component {
    constructor(props) {
        super(props);

        this.colors = props.colors.map(color => {
            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        });
    }

    render() {
        return (
            <RealTimeChart
                {...this.props}

                colors={this.colors}
                dataFetch={this.props.dataFetch}
            />
        );
    }
}

export default connect(props => {
    return {
        dataFetch: { url: props.endpoint, refreshInterval: 300000 },
    };
})(RealTimeChartContainer);
