import React from 'react';

import ExperimentsTable from '../views/ExperimentsTable';
import { sortedByProperty, reverseSortedByProperty } from '../../lib/utils';


/**
 * It would be nice to use a third-party component for this, like reactable[1],
 * but reactable appears to be the best option and yet it's unmaintained.
 *
 * [1] https://github.com/glittershark/reactable
 */
export default class extends React.Component {
    constructor(props) {
        super(props);

        this.columns = ['name', 'startDate'];

        // Chache sorting results
        this.sorts = {};
        this.columns.forEach(column => {
            this.sorts[column] = {};
            this.sorts[column]['ascending'] = sortedByProperty(props.experiments, column);
            this.sorts[column]['descending'] = reverseSortedByProperty(props.experiments, column);
        });

        this.state = {
            sortedColumn: 'name',
            sortDirection: 'ascending',
        };

        this._handleNameClick = this._handleNameClick.bind(this);
        this._handleStartDateClick = this._handleStartDateClick.bind(this);
    }

    _getOppositeDirection(direction) {
        if (direction === 'ascending') return 'descending';
        if (direction === 'descending') return 'ascending';
    }

    _handleClick(column) {
        let newSortDirection;
        if (this.state.sortedColumn === column) {
            newSortDirection = this._getOppositeDirection(this.state.sortDirection);
        } else {
            newSortDirection = 'ascending';
        }

        this.setState({
            sortedColumn: column,
            sortDirection: newSortDirection,
        });
    }

    _handleNameClick() {
        this._handleClick('name');
    }

    _handleStartDateClick() {
        this._handleClick('startDate');
    }

    render() {
        return (
            <ExperimentsTable
                sortedExperiments={this.sorts[this.state.sortedColumn][this.state.sortDirection]}

                handleNameClick={this._handleNameClick}
                handleStartDateClick={this._handleStartDateClick}

                sortedColumn={this.state.sortedColumn}
                sortDirection={this.state.sortDirection}
            />
        );
    }
}
