import React from 'react';

import { loadStripe } from '@stripe/stripe-js';

import { Button } from 'shards-react';

import { Link } from 'react-router-dom';

import Navigation from '../Components/Navigation.js';

import request from 'superagent';

import withContext from '../Context/withContext.js';

import styles from '../Css/Manage.module.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);

function Manage(props) {
    const createCheckoutSession = async () => {
        const stripe = await stripePromise;

        const response = await request
            .post(process.env.REACT_APP_SERVER + '/stripe/create-checkout-session')
            .send({ token: props.context.token });

        const result = await stripe.redirectToCheckout({
            sessionId: response.body.sessionId,
        });

        if (result.error) console.error(result.error);
    };

    const createPortalSession = async () => {
        const response = await request
            .post(process.env.REACT_APP_SERVER + '/stripe/customer-portal')
            .send({ token: props.context.token });

        window.location = response.body.url;
    };

    return (
        <div>
            <Navigation />
            <div className={styles.dashboard}>
                {
                    props.context.user.premium
                        ?
                        [
                            <h2 className='white'>
                                You're currently on the <strong>premium</strong> plan. Thank you for supporting us!
                            </h2>,
                            <img className={styles.pepe} alt='pepe' src='./dancing_pepe.gif' />,
                            <br />,
                            <Button onClick={createPortalSession}>Manage billing</Button>
                        ]
                        :
                        [
                            <h2 className='white'>
                                You're currently on the <strong>free</strong> plan.
                            </h2>,
                            <p>
                                If you'd like to show us some support, please upgrade to premium!
                                With premium, you get extra quality of life features such as:
                                <ul>
                                    <li>Auto create and assign pingable roles to members who are marked as going</li>
                                    <li>Auto deletion of expired events</li>
                                </ul>
                            </p>,
                            <Button onClick={createCheckoutSession}>Upgrade to premium</Button>
                        ]
                }
            </div>
        </div>
    );
}

export default withContext(Manage);
