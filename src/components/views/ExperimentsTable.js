import React from 'react';
import { Link } from 'react-router-dom';
import dateFormat from 'dateformat';

import Paginator from './Paginator';
import SearchBox from './SearchBox';

import './css/ExperimentsTable.css';


// Returns a table cell with link to either a regular or realtime details page.
const getExperimentCell = experiment => {
    if (experiment.realtime) {
        return <td><Link to={`/realtime/${experiment.slug}/`}>{experiment.slug}</Link></td>;
    }
    return <td><Link to={`/experiments/${experiment.slug}/`}>{experiment.name || experiment.slug}</Link></td>;
};

export default props => {
    let maybePaginator = null;
    if (!props.searchActive) {
        maybePaginator = (
            <Paginator
                initialPage={props.initialPage - 1} // zero-based
                pageCount={Math.ceil(props.numItems / props.itemsPerPage)}
                onPageChange={props.onPageChange}
            />
        );
    }

    return (
        <div className="experiments-table-container">
            <SearchBox onKeyUp={props.onSearch} />
            <table className="experiments-table">
                <colgroup>
                    <col className="experiment-name" />
                    <col className="experiment-creation-date" />
                </colgroup>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Creation date</th>
                    </tr>
                </thead>
                <tbody>
                    {props.visibleExperiments.map((e, index) => (
                        <tr key={index} className={e.realtime ? 'realtime' : ''}>
                            {getExperimentCell(e)}
                            <td>{e.creationDate && dateFormat(e.creationDate, 'longDate', true)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {maybePaginator}
        </div>
    );
}
