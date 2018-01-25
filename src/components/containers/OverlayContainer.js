import React from 'react';
import { withRouter } from 'react-router-dom';

import Overlay from '../views/Overlay';


class OverlayContainer extends React.Component {
    /**
     * When the overlay is clicked, don't propagate that same onClick event to
     * the wrapper parent.
     */
    onClick = e => {
        e.stopPropagation();
    }

    render() {
        return (
            <Overlay
                {...this.props}
                onClose={this.props.onClose}
                onClick={this.onClick}
            />
        );
    }
}

export default withRouter(OverlayContainer);
