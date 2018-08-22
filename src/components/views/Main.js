import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomeContainer from '../containers/HomeContainer';
import ExperimentContainer from '../containers/ExperimentContainer';
import RealtimeExperimentContainer from '../containers/RealtimeExperimentContainer';


export default () => (
    <main>
        <Switch>
            <Route exact path="/" component={HomeContainer} />
            <Route exact path="/experiments/:experimentSlug" component={ExperimentContainer} />
            <Route exact path="/realtime/:experimentSlug" component={RealtimeExperimentContainer} />
        </Switch>
    </main>
);
