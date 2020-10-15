import React from 'react';
import styles from '../Css/Home.module.css';

function Home() {
    return (
        <div>
            <div className={styles.bannerContainer + ' ' + styles.slanted}>
                <div className={`${styles.banner} row`}>
                    <div className={`${styles.bannerItem + ' ' + styles.bannerText} col-md-6 col-12`}>
                        <div className={styles.bannerText}>
                            <h1 className={styles.white}>Event Organisation</h1>
                            <h2 className={styles.fadedBlue}>In one place</h2>
                        </div>
                    </div>
                    <div className={`${styles.bannerItem} col-md-6 col-12`}>
                        <img className={styles.icon} alt='example' src='./icon.png' />
                    </div>
                </div>
            </div>
            <div className={`${styles.content} row`}>
                <div className={`${styles.detail} col-md-6 col-12`}>
                    <div className={styles.textblock}>
                        <p className={styles.heading}>Organising events don't have to be hard.</p>
                        <p className={styles.subheading}>
                            Event Organiser bot is the Discord solution to scheduling virtual or
                            in real life events. Quickly and simply collect attendance for any future
                            event you have in mind!
                        </p>
                    </div>
                </div>
                <div className={`${styles.detail} col-md-6 col-12`}>
                    <img alt='example' src='./discord.gif' width='500px' />
                </div>
            </div>
            <div className={styles.featuresSection}>
                <div className={styles.content}>
                    <h3>Features</h3>
                    <div className='row'>
                        <div className={`${styles.feature} col-md-6 col-12`}>
                            <img className={styles.featureIcon} alt='tick' src='./tick.png' />
                            <p className={styles.heading}>Reaction based inputs</p>
                            <p className={styles.explanation}>
                                Users can mark themselves as Going, Not Going, or Unsure simply by
                                clicking on the provided reactions.
                        </p>
                        </div>
                        <div className={`${styles.feature} col-md-6 col-12`}>
                            <img className={styles.featureIcon} alt='reminder' src='./reminder.png' />
                            <p className={styles.heading}>Automatic reminders for upcoming events</p>
                            <p className={styles.explanation}>
                                Attendees will be automatically reminded of upcoming events they are attending.
                        </p>
                        </div>
                        <div className={`${styles.feature} col-md-6 col-12`}>
                            <img className={styles.featureIcon} alt='role' src='./role.png' />
                            <p className={styles.heading}>Automatic role assigning for attendees</p>
                            <p className={styles.explanation}>
                                Attendees are assigned a specially created event role to make notifying them
                                of changes extremely easy.
                        </p>
                        </div>
                        <div className={`${styles.feature} col-md-6 col-12`}>
                            <img className={styles.featureIcon} alt='bin' src='./bin.png' />
                            <p className={styles.heading}>Automatic expiry and deletion of past events.</p>
                            <p className={styles.explanation}>
                                Old events are deleted weekly to reduce event channel clutter.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
