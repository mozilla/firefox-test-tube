import React from 'react';
import { Link } from 'react-router-dom';
import dateFormat from 'dateformat';

import { sortByProperty } from '../../lib/utils';


export default props => {
    const sortedExperiments = sortByProperty(props.experiments, 'name');

    return (
        <table>
            <colgroup>
                <col className="experiment-name" />
                <col className="experiment-start-date" />
            </colgroup>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Start date</th>
                </tr>
            </thead>
            <tbody>
                {sortedExperiments.map((e, index) => (
                    <tr key={index}>
                        <td><Link to={`/experiment/${e.id}/`}>{e.name || e.slug}</Link></td>
                        <td>{dateFormat(e.startDate, 'longDate', true)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
