import React, { useState, useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import Context from './Context/Context.js';

import Commands from './Pages/Commands.js';
import HomePage from './Pages/HomePage.js';
import Manage from './Pages/Manage.js';

import request from 'superagent';

const history = createBrowserHistory();

history.listen(location => {
    if (!window.gtag) {
        return;
    }
    window.gtag('event', 'page_view', {
        page_location: location.href,
        page_path: location.pathname + location.search
    });
});

function App() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState({
        username: null,
        id: null,
        email: null,
        avatarHash: null,
        premium: null
    });

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        if (!token) return;

        request
            .get(process.env.REACT_APP_SERVER + '/getUser')
            .query({
                token
            })
            .then(res => {
                setUser({
                    username: res.body.content.username,
                    id: res.body.content.id,
                    email: res.body.content.email,
                    avatarHash: res.body.content.avatar,
                    premium: res.body.content.premium
                });
            })
            .catch(err => {
                if (err.status === 403) {
                    localStorage.removeItem('token');
                    window.location.replace(process.env.REACT_APP_DISCORD_AUTH);
                    return;
                }
                console.error(err);
            });
    }, [token]);

    return (
        <Context.Provider value={{
            user,
            token,
            setUser,
            setToken
        }}>
            <Router history={history}>
                <Switch>
                    <Route path='/commands' component={Commands} />
                    <Route path='/manage' component={Manage} />
                    <Route path='/' component={HomePage} />
                </Switch>
            </Router>
        </Context.Provider >
    );
}

export default App;
