import React from 'react';
import { Link } from 'react-router-dom';

import Paginator from './Paginator';
import { sortByProperty } from '../../lib/utils';


export default props => {
    const sortedExperiments = sortByProperty(props.experiments, 'name');

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Start date</th>
                </tr>
            </thead>
            <tbody>
                {sortedExperiments.map((e, index) => (
                    <tr key={index}>
                        <td><Link to={`/experiment/${e.id}/`}>{e.name || `Experiment #${e.id}`}</Link></td>
                        <td></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
