import React from 'react';
import { withRouter } from 'react-router-dom';

import Overlay from '../views/Overlay';


class OverlayContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onWrapperClick = this.onWrapperClick.bind(this);
    }

    onWrapperClick() {
        this.props.history.push(this.props.closeTo);
    }

    /**
     * A simple function that prevents onWrapperClick from being run. If this
     * event is bound to the onClick function of a child, the onWrapperClick
     * function won't run when the child is clicked.
     */
    onOverlayClick(e) {
        e.stopPropagation();
    }

    render() {
        return (
            <Overlay
                {...this.props}
                onWrapperClick={this.onWrapperClick}
                onOverlayClick={this.onOverlayClick}
            />
        );
    }
}

export default withRouter(OverlayContainer);
