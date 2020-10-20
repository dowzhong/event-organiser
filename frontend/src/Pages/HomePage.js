import React, { useEffect } from 'react';
import styles from '../Css/Home.module.css';

import Navigation from '../Components/Navigation.js';

import * as qs from 'query-string';

import withContext from '../Context/withContext.js';

import { Button } from 'shards-react';

function HomePage(props) {
    useEffect(() => {
        const queryString = qs.parse(props.location.search);
        if (queryString.token) {
            localStorage.setItem('token', queryString.token);
            window.location.replace('/');
            return;
        }
        props.context.setToken(localStorage.getItem('token'));
    }, []);

    return (
        <div>
            <Navigation />
            <div className={styles.bannerContainer + ' ' + styles.slanted}>
                <div className={`${styles.banner}`}>
                    <div className={`${styles.bannerItem + ' ' + styles.bannerText}`}>
                        <div className={styles.bannerText}>
                            <h1>The solution to your scheduling troubles.</h1>
                            <h3 className={styles.faded}>Event scheduling, logistics, attendance<br/> All in Discord.</h3>
                        </div>
                        <Button 
                        onClick={() => {
                            window.location = process.env.REACT_APP_BOT_INSTALL
                        }}
                        className={styles.discordAdd}>
                            Add to Discord
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.mainBody}>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 col-12 order-md-1 align-middle`}>
                        <div className={`${styles.textblock}`}>
                            <p className={styles.heading}>Reaction-based user input.</p>
                            <p className={styles.subheading}>
                                Make attendance collection frictionless for all participants. Simply click on a reaction
                                to mark yourself as going, not going, or even unsure.
                            </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <img className={`mx-auto d-block ${styles.showcase}`} alt='example' src='./discord.gif' width='500px' />
                    </div>
                </div>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <div className={styles.textblock}>
                            <p className={styles.heading}>Organising events doesn't have to be hard.</p>
                            <p className={styles.subheading}>
                                Never forget an upcoming event with automatic reminders of things occuring on the horizon!
                        </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-1 col-12`}>
                        <img className={`mx-auto d-block ${styles.showcase}`} alt='example' src='./event_reminder.png' width='500px' />
                    </div>
                </div>
                <h2 id='premiumFeatures' className={styles.premiumHeader}>Unlock additional features for $5/mo!</h2>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 order-md-1 col-12`}>
                        <div className={styles.textblock}>
                            <p className={styles.heading}>Automatic role assigning for attendees.</p>
                            <p className={styles.subheading}>
                                Attendees are assigned a specially created event role to make notifying them of changes extremely easy.
                        </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <img className={`mx-auto d-block ${styles.showcase}`} alt='example' src='./roles.png' width='500px' />
                    </div>
                </div>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <div className={styles.textblock}>
                            <p className={styles.heading}>Automatic expiry of past events.</p>
                            <p className={styles.subheading}>
                                Quickly find upcoming events that you might be interested in without needing to double check
                                if the event already happened.
                        </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-1 col-12`}>
                        <img className={`mx-auto d-block ${styles.showcase}`} alt='example' src='./expired.png' width='500px' />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default withContext(HomePage);
