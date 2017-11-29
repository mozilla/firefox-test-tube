import React from 'react';

import ExperimentsTable from '../views/ExperimentsTable';
import { visiblePaginatorMembers, reverseSortedByProperty } from '../../lib/utils';


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.initialPageNumber = 1;
        this.experimentsPerPage = 10;

        this.state = {
            pageNumber: this.initialPageNumber,
        };

        this._handlePaginate = this._handlePaginate.bind(this);
    }

    _handlePaginate(e) {
        this.setState({ pageNumber: e.selected + 1 }); // zero-based
    }

    render() {
        const sortedExperiments = reverseSortedByProperty(this.props.experiments, 'startDate');
        const visibleExperiments = visiblePaginatorMembers(sortedExperiments, this.experimentsPerPage, this.state.pageNumber);

        return (
            <ExperimentsTable
                experiments={visibleExperiments}

                initialPageNumber={this.initialPageNumber}
                numExperiments={this.props.experiments.length}
                experimentsPerPage={this.experimentsPerPage}

                handlePaginate={this._handlePaginate}
            />
        );
    }
}
