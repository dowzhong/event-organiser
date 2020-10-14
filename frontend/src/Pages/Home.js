import React from 'react';
import styles from '../Css/Home.module.css';

function Home() {
    return (
        <div>
            <div className={styles.bannerContainer + ' ' + styles.slanted}>
                <div className={`${styles.banner} row`}>
                    <div className={`${styles.bannerItem + ' ' + styles.bannerText} col-md-6 col-12`}>
                        <h1 className={styles.white}>Event Organisation</h1>
                        <h2 className={styles.fadedBlue}>In one place</h2>
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
                    <img alt='example' src='./discord.png' />
                </div>
            </div>
        </div>
    );
}

export default Home;
