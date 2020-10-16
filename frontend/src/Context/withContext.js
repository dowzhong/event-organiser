import React from 'react';
import Context from './Context.js';

function withContext(Component) {
    return props => {
        return (
            <Context.Consumer>
                {context => <Component {...props} context={context} />}
            </Context.Consumer>
        );
    }
}

export default withContext;