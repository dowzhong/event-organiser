import React, { useEffect, useState } from 'react';

import Navigation from '../Components/Navigation.js';

import request from 'superagent';

import withContext from '../Context/withContext.js';

function Manage(props) {
    const [ownedGuilds, setOwnedGuilds] = useState([]);

    useEffect(() => {
        if (!props.context.token) return;

        request
            .get(process.env.REACT_APP_SERVER + '/getUserOwnedGuilds')
            .query({ token: props.context.token })
            .then(response => setOwnedGuilds(response.body.content))
            .catch(err => console.error(err));
    }, [props.context.token]);

    return (
        <div>
            <Navigation user={props.context.user} token={props.context.token} />
            <h1>Guilds</h1>
            {
                ownedGuilds.map(guild => <p>{guild.name}</p>)
            }
        </div>
    );
}

export default withContext(Manage);
