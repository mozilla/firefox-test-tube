import React from 'react';
import { Icon } from 'react-fa';

import './css/Loading.css';


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { component: null };
        this.wait = 500;
        this.loadingComponent = (
            <div id="loading">
                <Icon spin name="circle-o-notch" />
            </div>
        );
    }

    /**
     * Only show the spinner after this.wait milliseconds.
     */
    componentDidMount() {
        setTimeout(() => {
            this.setState({ component: this.loadingComponent });
        }, this.wait);
    }

    render() {
        return this.state.component;
    }
}
