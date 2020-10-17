import React from 'react';
import styles from '../Css/ServerListItem.module.css';

function ServerListItem(props) {
    return (
        <p className={styles.serverName}>{props.serverName}</p>
    );
}

export default ServerListItem;