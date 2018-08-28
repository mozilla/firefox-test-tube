import React from 'react';
import { withRouter } from 'react-router-dom';

import MonitoringChartContainer from '../containers/MonitoringChartContainer';


function RealtimeExperimentContainer(props) {
    const slug = this.props.match.params.experimentSlug;
    const size = {width: 900, height: 400};

    return (
        <article id="experiment">
            <h2>{slug}</h2>
            <div className="monitoring-charts-remix">
                <p>
                    These are real-time enrollment charts for experiments that are not yet imported. Once
                    the nightly import job finishes they will appear on the detailed experiment page.
                </p>
                <MonitoringChartContainer
                    endpoint={`${process.env.REACT_APP_API_URL}/experiments/${slug}/realtime-enrolls/`}
                    title="Enrollments (5min)"
                    refreshMins={5}
                    size={size}
                />
                <MonitoringChartContainer
                    endpoint={`${process.env.REACT_APP_API_URL}/experiments/${slug}/realtime-unenrolls/`}
                    title="Unenrollments (5min)"
                    refreshMins={5}
                    size={size}
                />
            </div>
        </article>
    );
}

export default withRouter(RealtimeExperimentContainer);
