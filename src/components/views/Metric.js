import React from 'react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'react-fa';

import ChartContainer from '../containers/ChartContainer';
import OverlayContainer from '../containers/OverlayContainer';
import ChartColors from '../containers/ChartColors';
import URLManager from '../../lib/URLManager';

import './css/Metric.css';


export default withRouter(props => {
    const um = new URLManager(props.location, props.history);

    function buildNValuesDL(nValues) {
        let pairs = [];
        let i = 0;

        for (let populationName in nValues) {
            let itemColor = {backgroundColor: `rgb(${ChartColors[i].r}, ${ChartColors[i].g}, ${ChartColors[i].b})`};
            let borderColor = {border: `1px solid rgb(${ChartColors[i].r}, ${ChartColors[i].g}, ${ChartColors[i].b})`};

            if (nValues.hasOwnProperty(populationName)) {

                pairs.push(
                    <div key={populationName}>
                        <dt style={itemColor}>{populationName}</dt>
                        <dd style={borderColor}>
                            {nValues[populationName].toLocaleString('en-US')} pings
                        </dd>
                    </div>
                );
                i++;
            }
        }

        return <dl>{pairs}</dl>;
    }

    if (props.asOverlay) {
        return (
            <OverlayContainer title={props.name} onClose={() => um.removeQueryParameter('chart')}>
                <ChartContainer {...props} />
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
                <ChartContainer {...props} />
            </section>
        );
    }
});
