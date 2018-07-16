import React from 'react';


export default props => {
    // Show a page title by default, but don't show one if the showPageTitle
    // prop was explicitly set to false.
    let maybePageTitle = null;
    if (props.showPageTitle !== false) {
        maybePageTitle = <h2>Error</h2>;
    }

    return (
        <section className="error">
            {maybePageTitle}
            <p>{props.message}</p>
        </section>
    );
};
