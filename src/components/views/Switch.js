import React from 'react';

import './css/Switch.css';


export default class extends React.Component {
    toggleSwitch = evt => {
        function getWrapper(elm) {
            if (elm.classList.contains('switch-content')) {
                return elm;
            }
            return getWrapper(elm.parentNode);
        }

        let switchWrapper = getWrapper(evt.target);
        switchWrapper.querySelector('.switch').classList.toggle('active');

        // React components can only have 1 event listener (of a type) so
        // handle the passed onClick as well.
        this.props.onClick(switchWrapper);
    }

    render() {
        let labelElm = null;
        if (this.props.label) {
            labelElm = <span title={this.props.hoverString}>{this.props.label}</span>
        }

        return (
            <div className="switch-wrapper">
                <div className="switch-content" onClick={this.toggleSwitch}>
                    <span className={this.props.active ? 'switch active' : 'switch'}>
                        <b className="handle" />
                    </span>
                    {labelElm}
                </div>
            </div>
        );
    }
}
