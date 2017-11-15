import React from 'react';
import { Icon } from 'react-fa';

import './css/Loading.css';


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showSpinner: false };
    }

    /**
     * Only show the spinner after the given number of milliseconds.
     */
    componentDidMount() {
        this.loadingTimeout = setTimeout(() => {
            this.setState({ showSpinner: true });
        }, process.env.REACT_APP_SPINNER_WAIT);
    }

    /**
     * Ensure that setState is not called after the component is unmounted, as
     * this will cause React to throw a warning.
     */
    componentWillUnmount() {
        clearTimeout(this.loadingTimeout);
    }

    render() {
        if (this.state.showSpinner) {
            return (
                <div id="loading">
                    <Icon spin name="circle-o-notch" />
                </div>
            );
        }

        return null;
    }
}
