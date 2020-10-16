import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Context from './Context/Context.js';

import HomePage from './Pages/HomePage.js';
import Manage from './Pages/Manage.js';

import request from 'superagent';

function App() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState({
        username: null,
        id: null,
        email: null,
        avatarHash: null
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
                    avatarHash: res.body.content.avatar
                });
            })
            .catch(err => {
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
            <BrowserRouter>
                <Switch>
                    <Route path='/manage' component={Manage} />
                    <Route path='/' component={HomePage} />
                </Switch>
            </BrowserRouter>
        </Context.Provider >
    );
}

export default App;
