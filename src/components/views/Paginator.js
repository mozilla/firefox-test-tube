import React from 'react';
import ReactPaginate from 'react-paginate';

import './css/ReactPaginate.css';


/**
 * Wrapper class for ReactPaginate that sets some defaults
 */
export default props => {
    // Don't show a paginator if there is only one page
    if (props.pageCount === 1) {
        return null;
    }

    return (
        <ReactPaginate
            containerClassName='react-paginate'
            activeClassName='active'

            marginPagesDisplayed={1}
            pageRangeDisplayed={4}

            previousLabel='previous'
            nextLabel='next'

            // This line must be last if we want the provided props to override the
            // defaults set above
            {...props}
        />
    );

};
