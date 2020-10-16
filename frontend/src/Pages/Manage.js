import React, { useEffect, useState } from 'react';
import styles from '../Css/Home.module.css';

import Navigation from '../Components/Navigation.js';

import * as qs from 'query-string';
import request from 'superagent';

import withContext from '../Context/withContext.js';

function Manage(props) {
    return (
        <div>
            <Navigation user={props.context.user} token={props.context.token} />
            <h1>Guilds</h1>
        </div>
    );
}

export default withContext(Manage);
