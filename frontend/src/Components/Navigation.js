import React, { useState, useEffect } from 'react';
import styles from '../Css/Home.module.css';

import withContext from '../Context/withContext.js';

import {
    Button,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    Collapse
} from 'shards-react';

import { Link } from 'react-router-dom';

function Navigation(props) {
    const [userDropdown, setUserDropdown] = useState(false);
    const [collapse, setCollapse] = useState(false);
    const toggle = () => setUserDropdown(!userDropdown);
    const toggleCollapse = () => setCollapse(!collapse);

    useEffect(() => {
        console.log(props.context);
    })



    return (
        <Navbar type='dark' expand='md' className={styles.navbar}>
            <NavbarBrand href='#'>Event Organizer Bot</NavbarBrand>
            <NavbarToggler onClick={toggleCollapse} />
            <Collapse open={collapse} navbar>
                <Nav navbar className="ml-auto">
                    {
                        props.context.token
                            ? <Dropdown open={userDropdown} toggle={toggle} className={`d-table`}>
                                <DropdownToggle theme='dark'>
                                    <img
                                        className={styles.avatar}
                                        alt='avatar'
                                        style={{
                                            width: '25px',
                                            borderRadius: '50%',
                                            marginRight: '10px'
                                        }} src={`https://cdn.discordapp.com/avatars/${props.context.user.id}/${props.context.user.avatarHash}.png`} />
                                    {props.context.user.username ? props.context.user.username + ' ▾' : '-'}
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <Link to='/manage'>
                                        <DropdownItem className={styles.white}>
                                            Manage plan
                                        </DropdownItem>
                                    </Link>
                                    <DropdownItem className={styles.red}>Log out</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            : <Button
                                onClick={() => {
                                    window.location = process.env.REACT_APP_DISCORD_AUTH
                                }}
                                className={styles.navbarButton}
                            >
                                Sign in through Discord
                            </Button>
                    }
                </Nav>
            </Collapse>
        </Navbar>
    );
}

export default withContext(Navigation);