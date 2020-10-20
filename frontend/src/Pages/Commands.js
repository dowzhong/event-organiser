import React from 'react';

import { loadStripe } from '@stripe/stripe-js';

import Navigation from '../Components/Navigation.js';

import withContext from '../Context/withContext.js';

import styles from '../Css/Manage.module.css';


function Commands(props) {
    return (
        <div>
            <Navigation />
            <div className={styles.dashboard}>
                <h1 className='white'>
                    Commands
                </h1>
                <div className='commands'>
                    <div className='command'>
                        <p className='commandHandle'>!new {'{event name}'}</p>
                        <p className='commandDescription'>
                            Create a new event.
                            The bot will then ask you to provide further information.
                            <br />
                            <br />
                        </p>
                        <p className='commandExample'>
                            !new BBQ and Chill
                        </p>
                    </div>
                    <div className='command'>
                        <p className='commandHandle'>!delete {'{event id}'}</p>
                        <p className='commandDescription'>
                            Delete an event.
                        </p>
                        <p className='commandExample'>
                            !delete 13
                        </p>
                    </div>
                    <div className='command'>
                        <p className='commandHandle'>!edit {'{event id} {name|date|description} {new}'}</p>
                        <p className='commandDescription'>
                            Edit an event.
                        </p>
                        <p className='commandExample'>
                            !edit 13 name BBQ and board games
                            <br />
                            !edit 13 date 13/12/2020 13:00
                            <br />
                            !edit 13 date 1/9/2020 10:00
                            <br />
                            !edit 13 description Just hang around Jason's backyard. Please bring
                            drinks or food :)
                            <br />
                        </p>
                    </div>
                    <div className='command'>
                        <p className='commandHandle'>!setutc {'{utc offset}'}</p>
                        <p className='commandDescription'>
                            Set the UTC timezone for this server. Default is 0.
                        </p>
                        <p className='commandExample'>
                            !setutc 11
                            <br />
                            !setutc -8
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withContext(Commands);
