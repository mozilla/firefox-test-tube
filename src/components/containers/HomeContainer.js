import React from 'react';
import { connect } from 'react-refetch';

import Home from '../views/Home';
import Loading from '../views/Loading';
import Error from '../views/Error';


const HomeContainer = props => {
    const experimentsFetch = props.experimentsFetch;

    if (experimentsFetch.pending) {
        return <Loading />;
    } else if (experimentsFetch.rejected) {
        return <Error message={experimentsFetch.reason.message} />;
    } else if (experimentsFetch.fulfilled) {
        return (
            <Home experiments={experimentsFetch.value.experiments} />
        );
    }
};

export default connect(() => ({
    experimentsFetch: `${process.env.REACT_APP_API_URL}/experiments/`,
}))(HomeContainer);
