import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-refetch';

import Experiment from '../views/Experiment';
import Loading from '../views/Loading';
import Error from '../views/Error';
import URLManager from '../../lib/URLManager';
import { visiblePaginatorMembers } from '../../lib/utils';


class ExperimentContainer extends React.Component {
    constructor(props) {
        super(props);

        this.urlManager = new URLManager(props.location, props.history);
        this.defaultShowOutliers = false;

        this.fetchedMetricIds = false;
        this.allMetricIds = [];

        // Pagination
        this.initialPage = Number(this.urlManager.getQueryParameter('page')) || 1;
        this.itemsPerPage = 22;
        this.state= {
            pageNumber: this.initialPage,
        };

        this._onPageChange = this._onPageChange.bind(this);
    }

    _onPageChange(e) {
        const currentPageNumber = e.selected + 1; // zero-based
        this.urlManager.setQueryParameter('page', currentPageNumber);
        this.setState({ pageNumber: currentPageNumber });
    }

    componentWillReceiveProps(nextProps) {
        if (this.fetchedMetricIds === false && nextProps.experimentFetch.value.metrics) {
            this.fetchedMetricIds = true;
            this.allMetricIds = nextProps.experimentFetch.value.metrics.map(m => m.id);
        }
    }

    componentWillUpdate(nextProps) {
        this.urlManager = new URLManager(nextProps.location, nextProps.history);
    }

    render() {
        const experimentFetch = this.props.experimentFetch;
        const visibleMetricIds = visiblePaginatorMembers(this.allMetricIds, this.itemsPerPage, this.state.pageNumber);

        if (experimentFetch.pending) {
            return <Loading />;
        } else if (experimentFetch.rejected) {
            return <Error message={experimentFetch.reason.message} />;
        } else if (experimentFetch.fulfilled) {
            return (
                <Experiment
                    id={Number(this.props.match.params.experimentId)}
                    name={experimentFetch.value.name}
                    slug={experimentFetch.value.slug}
                    description={experimentFetch.value.description}
                    authors={experimentFetch.value.authors}
                    populations={experimentFetch.value.populations}
                    showOutliers={this.defaultShowOutliers}
                    selectedMetricId={Number(this.urlManager.getQueryParameter('chart'))}

                    onPageChange={this._onPageChange}
                    initialPage={this.initialPage}
                    itemsPerPage={this.itemsPerPage}
                    numItems={this.allMetricIds.length}
                    visibleMetricIds={visibleMetricIds}
                />
            );
        }

        return <Error message="Error fetching experiment" />;
    }
}

// Gets us access to props.location and props.history
ExperimentContainer = withRouter(ExperimentContainer);

export default connect(props => {
    const id = props.match.params.experimentId;

    return {
        experimentFetch: { url: `${process.env.REACT_APP_API_URL}/experiments/${id}/` },
    };
})(ExperimentContainer);
