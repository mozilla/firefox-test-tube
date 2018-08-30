import React from 'react';
import Sifter from 'sifter';

import ExperimentsTable from '../views/ExperimentsTable';
import { visiblePaginatorMembers, reverseSortedByProperty, debounce } from '../../lib/utils';


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.initialPage = 1;
        this.itemsPerPage = 10;

        this.state = {
            pageNumber: this.initialPage,
        };

        this.sifter = new Sifter(props.experiments);

        this._setSearchPhrase = debounce(this._setSearchPhrase, process.env.REACT_APP_SEARCH_DEBOUNCE_TIME);
    }

    _onPageChange = e => {
        this.setState({ pageNumber: e.selected + 1}); // zero-based
    }

    _onSearch = e => {
        this._setSearchPhrase(e.target.value);
    }

    handleTableRowClick = e => {
        if (e.target.parentNode.nodeName === 'TR') {
            e.target.parentNode.querySelector('a').click();
        }
    }

    /**
     * This method is needed to make the debounce function work without the
     * event expiring.
     *
     * http://blog.revathskumar.com/2016/02/reactjs-using-debounce-in-react-components.html
     */
    _setSearchPhrase(searchPhrase) {
        this.setState({ searchPhrase })
    }

    render() {
        let visibleExperiments = [];
        let searchActive = false;

        if (this.state.searchPhrase) {
            const searchOptions = {
                fields: ['name', 'slug'],
                limit: this.itemsPerPage,
                sort: 'creationDate',
                direction: 'desc',
            };

            const matchedIndices = this.sifter.search(this.state.searchPhrase, searchOptions).items.map(e => e.id);
            visibleExperiments = this.props.experiments.filter((_, index) => matchedIndices.includes(index));
            searchActive = true;
        } else {
            // Sort visible experiments by 'creationDate' first then by 'realtime'.
            let sortedExperiments = reverseSortedByProperty(this.props.experiments, 'creationDate');
            sortedExperiments = reverseSortedByProperty(sortedExperiments, 'realtime');

            visibleExperiments = visiblePaginatorMembers(sortedExperiments, this.itemsPerPage, this.state.pageNumber);
        }

        return (
            <ExperimentsTable
                visibleExperiments={visibleExperiments}

                onPageChange={this._onPageChange}
                onSearch={this._onSearch}
                initialPage={this.initialPage}
                itemsPerPage={this.itemsPerPage}
                numItems={this.props.experiments.length}
                searchActive={searchActive}
                doTableRowClick={this.handleTableRowClick}
            />
        );
    }
}
