import React from 'react';
import { connect } from 'react-refetch';

import Experiment from '../views/Experiment';
import Loading from '../views/Loading';
import Error from '../views/Error';


const ExperimentContainer = props => {
    const experimentFetch = props.experimentFetch;

    if (experimentFetch.pending) {
        return <Loading />;
    } else if (experimentFetch.rejected) {
        return <Error message={experimentFetch.reason.message} />;
    } else if (experimentFetch.fulfilled) {
        return (
            <Experiment
                name={experimentFetch.value.name}
                description={experimentFetch.value.description}
                authors={experimentFetch.value.authors}
                metrics={experimentFetch.value.metrics}
                populations={experimentFetch.value.populations}
            />
        );
    }

    return <Error message="Error fetching experiment" />;
}

export default connect(props => {
    const experimentId = props.match.params.experimentId;

    return {
        experimentFetch: { url: `${process.env.REACT_APP_API_URL}/experiments/${experimentId}`, refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL) },
    };
})(ExperimentContainer);
