import React from 'react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'react-fa';

import ChartContainer from '../containers/ChartContainer';
import OverlayContainer from '../containers/OverlayContainer';
import URLManager from '../../lib/URLManager';

import './css/Metric.css';


export default withRouter(props => {
    const um = new URLManager(props.location, props.history);

    function buildNValuesDL(nValues) {
        let pairs = [];

        Object.keys(nValues).forEach((populationName, i) => {
            let itemColor = {backgroundColor: `rgb(${props.populationColors[i][0]}, ${props.populationColors[i][1]}, ${props.populationColors[i][2]})`};
            let borderColor = {border: `1px solid rgb(${props.populationColors[i][0]}, ${props.populationColors[i][1]}, ${props.populationColors[i][2]})`};

            pairs.push(
                <div key={populationName}>
                    <dt style={itemColor}>{populationName}</dt>
                    <dd style={borderColor}>
                        {nValues[populationName].toLocaleString('en-US')} pings
                    </dd>
                </div>
            );

        });

        return <dl>{pairs}</dl>;
    }

    if (props.asOverlay) {
        return (
            <OverlayContainer title={props.name} onClose={() => um.removeQueryParameter('chart')}>
                <ChartContainer
                    {...props}
                    populationColors={props.populationColors}
                />
            </OverlayContainer>
        );
    } else {
        let maybeDescription = null;
        if (props.description) {
            maybeDescription = (
                <p className="metric-description">{props.description}</p>
            );
        }

        return (
            <section className="metric">
                <div className="name-and-buttons">
                    <h4 className="metric-name">{props.name}</h4>

                    {/* There might be a better icon for this in the future */}
                    {/* https://github.com/FortAwesome/Font-Awesome/issues/1797 */}
                    <a className="chart-button-link" title="JSON" href={props.chartDataURL} target="_blank"><Icon className="chart-button" name="file-code-o" /></a>

                    <Icon className="chart-button" name="arrows-alt" title="Fullscreen" onClick={() => um.setQueryParameter('chart', props.id)} />
                </div>
                <section id="metric-details">
                    <h5>Details</h5>
                    {buildNValuesDL(props.nValues)}
                </section>
                {maybeDescription}
                <ChartContainer
                    {...props}
                    populationColors={props.populationColors}
                />
                <p id={`population-info-${props.id}`} className="population-info">
                    <span className="label" /> has a mean of <span className="mean" /> with a confidence
                    of &plusmn;<span className="confidence" />.
                </p>
            </section>
        );
    }
});
