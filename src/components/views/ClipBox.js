import React, { Component } from 'react';

import './css/ClipBox.css';


class ClipBox extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    handleInputFocus = e => {
        if (e.target) e.target.select();
    }

    handleCopyClick = e => {
        if (!e.target) return;
        e.target.parentNode.querySelector('input').select();
        document.execCommand('copy');
    }

    render() {
        return (
            <div className="clipbox">
                <label>
                    {this.props.label}
                    <input type="text" onFocus={this.handleInputFocus} readOnly value={this.props.textValue} />
                    <button onClick={this.handleCopyClick} className="btn-copy">copy to clipboard</button>
                </label>
            </div>
        );
    }
}

export default ClipBox;
