import React from 'react';
import { Link } from 'react-router-dom';
import dateFormat from 'dateformat';

import Paginator from './Paginator';

import './css/ExperimentsTable.css';


/**
 * This component returns a fragment, which is essentially just an array of
 * elements. Fragments allow you to return multiple elements without wrapping
 * them all in one meaningless parent <div>.
 *
 * Newer versions of React and Babel support an alternative syntax for
 * fragments. The new syntax is easier to read and doesn't require keys, so we
 * should probably switch to that once create-react-app supports it (probably by
 * about January 2018).
 *
 * https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html
 */
export default props => [
    (
        <table key="fragment-1" className="experiments-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Start date</th>
                </tr>
            </thead>
            <tbody>
                {props.experiments.map((e, index) => (
                    <tr key={index}>
                        <td><Link to={`/experiments/${e.id}/`}>{e.name || e.slug}</Link></td>
                        <td>{e.startDate && dateFormat(e.startDate, 'longDate', true)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    ),
    (
        <Paginator
            key="fragment-2"

            initialPage={props.initialPageNumber - 1} // zero-based
            pageCount={Math.ceil(props.numExperiments / props.experimentsPerPage)}
            onPageChange={props.handlePaginate}
        />
    ),
];
