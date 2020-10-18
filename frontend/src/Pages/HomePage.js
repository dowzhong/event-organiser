import React, { useEffect } from 'react';
import styles from '../Css/Home.module.css';

import Navigation from '../Components/Navigation.js';

import * as qs from 'query-string';

import withContext from '../Context/withContext.js';

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
                <div className={`${styles.banner} row`}>
                    <div className={`${styles.bannerItem + ' ' + styles.bannerText} col-md-6 col-12`}>
                        <div className={styles.bannerText}>
                            <h1>Event Organisation</h1>
                            <h2 className={styles.faded}>All in Discord</h2>
                        </div>
                    </div>
                    <div className={`${styles.bannerItem} col-md-6 col-12`}>
                        <img className={styles.icon} alt='example' src='./icon.png' />
                    </div>
                </div>
            </div>
            <div className={styles.mainBody}>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 col-12 order-md-1 align-middle`}>
                        <div className={`${styles.textblock}`}>
                            <p className={styles.heading}>Reaction based user input.</p>
                            <p className={styles.subheading}>
                                Organising events don't have to be hard. Quickly and simply collect attendance for any future
                                event you have in mind with the click of a button.
                        </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <img className='mx-auto d-block' alt='example' src='./discord.gif' width='500px' />
                    </div>
                </div>
                <div className={`${styles.content} row`}>
                    <div className={`${styles.detail} col-md-6 order-md-2 col-12`}>
                        <div className={styles.textblock}>
                            <p className={styles.heading}>Organising events don't have to be hard.</p>
                            <p className={styles.subheading}>
                                Never forget an upcoming event with automatic reminder of things occuring on the horizon!
                        </p>
                        </div>
                    </div>
                    <div className={`${styles.detail} col-md-6 order-md-1 col-12`}>
                        <img className='mx-auto d-block' alt='example' src='./event_reminder.png' width='500px' />
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
                        <img className='mx-auto d-block' alt='example' src='./roles.png' width='500px' />
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
                        <img className='mx-auto d-block' alt='example' src='./expired.png' width='500px' />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default withContext(HomePage);
