import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomeContainer from '../containers/HomeContainer';
import ExperimentContainer from '../containers/ExperimentContainer';


export default () => (
    <main>
        <Switch>
            <Route exact path="/" component={HomeContainer} />
            <Route exact path="/experiment/:experimentId" component={ExperimentContainer} />
            <Route exact path="/experiment/:experimentId/chart/:selectedMetricId" component={ExperimentContainer} />
        </Switch>
    </main>
);
