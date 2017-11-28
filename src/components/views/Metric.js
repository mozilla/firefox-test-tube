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

        for (let populationName in nValues) {
            if (nValues.hasOwnProperty(populationName)) {

                pairs.push(
                    <div key={populationName}>
                        <dt>{populationName}</dt>
                        <dd>{nValues[populationName].toLocaleString('en-US')}</dd>
                    </div>
                );

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
                    <div className="n-values">
                        <h6>n</h6>
                        {buildNValuesDL(props.nValues)}
                    </div>
                    <p className="metric-description">{props.description}</p>
                </section>
                <ChartContainer {...props} />
            </section>
        );
    }
});
