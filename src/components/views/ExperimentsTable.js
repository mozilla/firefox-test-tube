import React from 'react';
import { Link } from 'react-router-dom';
import dateFormat from 'dateformat';

import './css/ExperimentsTable.css';


export default props => {
    function _getHeaderClass(headerKey) {
        if (props.sortedColumn === headerKey) {
            return `sorted ${props.sortDirection}`;
        }
    }

    return (
        <table className="sortable">
            <colgroup>
                <col className="experiment-name" />
                <col className="experiment-start-date" />
            </colgroup>
            <thead>
                <tr>
                    <th id={props.nameId} className={_getHeaderClass('name')} onClick={props.handleNameClick}>Name</th>
                    <th id={props.startDateId} className={_getHeaderClass('startDate')} onClick={props.handleStartDateClick}>Start date</th>
                </tr>
            </thead>
            <tbody>
                {props.sortedExperiments.map((e, index) => (
                    <tr key={index}>
                        <td><Link to={`/experiments/${e.id}/`}>{e.name || e.slug}</Link></td>
                        <td>{e.startDate && dateFormat(e.startDate, 'longDate', true)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
