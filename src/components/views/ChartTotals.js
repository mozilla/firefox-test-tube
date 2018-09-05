import React from 'react';

import './css/ChartTotals.css';


export default props => {
    const cohorts = Object.keys(props.totals);

    return (
        <dl className={props.fullWidth ? 'chart-totals full-width' : 'chart-totals'}>
          <dt>Total:</dt>
          <dd>
            {cohorts.map((cohort, i) => {
                // Looks weird but outputs 3 + 4 = 7 etc.
                return (
                    <span key={i}>
                        <em style={{color: props.colors[i]}}>
                            {props.totals[cohort].toLocaleString('en-US')}
                        </em>
                        {i < cohorts.length - 1 ? ' + ' : ' '}
                    </span>
                );
            })}
            = {props.grandTotal.toLocaleString('en-US')}
          </dd>
        </dl>
    );
};
