import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home';

export default () => (
    <main>
        <Switch>
            <Route exact path="/" component={Home} />
        </Switch>
    </main>
);
