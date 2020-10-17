import React, { useEffect, useState } from 'react';

import { loadStripe } from '@stripe/stripe-js';

import { Button } from 'shards-react';

import Navigation from '../Components/Navigation.js';

import request from 'superagent';

import withContext from '../Context/withContext.js';

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
            <Navigation user={props.context.user} token={props.context.token} />
            <Button onClick={createCheckoutSession}>Stripe</Button>
            <p />
            <Button onClick={createPortalSession}>Portal</Button>
        </div>
    );
}

export default withContext(Manage);
