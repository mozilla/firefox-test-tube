import React from 'react';

import ExperimentsTable from '../views/ExperimentsTable';
import { visiblePaginatorMembers, reverseSortedByProperty } from '../../lib/utils';


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.initialPage = 1;
        this.itemsPerPage = 10;

        this.state = {
            pageNumber: this.initialPage,
        };

        this._onPageChange = this._onPageChange.bind(this);
    }

    _onPageChange(e) {
        this.setState({ pageNumber: e.selected + 1}); // zero-based
    }

    render() {
        const sortedExperiments = reverseSortedByProperty(this.props.experiments, 'startDate');
        const visibleExperiments = visiblePaginatorMembers(sortedExperiments, this.itemsPerPage, this.state.pageNumber);

        return (
            <ExperimentsTable
                visibleExperiments={visibleExperiments}

                onPageChange={this._onPageChange}
                initialPage={this.initialPage}
                itemsPerPage={this.itemsPerPage}
                numItems={this.props.experiments.length}
            />
        );
    }
}
