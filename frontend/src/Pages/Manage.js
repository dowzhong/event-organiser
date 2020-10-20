import React, { useEffect } from 'react';

import { loadStripe } from '@stripe/stripe-js';

import { Button } from 'shards-react';

import Navigation from '../Components/Navigation.js';

import request from 'superagent';

import withContext from '../Context/withContext.js';

import styles from '../Css/Manage.module.css';

import { useToasts } from 'react-toast-notifications';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);


function Manage(props) {
    const { addToast } = useToasts();

    const createCheckoutSession = async () => {
        const stripe = await stripePromise;

        const response = await request
            .post(process.env.REACT_APP_SERVER + '/stripe/create-checkout-session')
            .send({ token: props.context.token });

        const result = await stripe.redirectToCheckout({
            sessionId: response.body.sessionId,
        });

        if (result.error) {
            addToast('An issue was encountered while creating your checkout session. Please try again later.', {
                appearance: 'error',
                autoDismiss: false,
            });
        };
    };

    useEffect(() => {
        if (!localStorage.getItem('token'))
            window.location.replace(process.env.REACT_APP_DISCORD_AUTH);
    }, []);

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
                                If you'd like to show us some support, please upgrade to premium for <strong>$5/month</strong>!
                                With premium, you get extra quality of life features such as:
                                <ul>
                                    <li>Auto create and assign pingable roles to members who are marked as going</li>
                                    <li>Auto deletion of expired events</li>
                                </ul>
                            </p>,
                            <Button onClick={createCheckoutSession}>Upgrade to premium for $5/mo</Button>
                        ]
                }
            </div>
        </div>
    );
}

export default withContext(Manage);
