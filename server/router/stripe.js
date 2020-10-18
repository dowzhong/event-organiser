const config = require('../../config.js');

const express = require('express');
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET);

const database = require('../../database.js');

const hasToken = require('../middleware/hasToken');

router.get('/checkout-session', async (req, res) => {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
});


router.post('/create-checkout-session', hasToken, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: config.premiumPlanId,
                    quantity: 1,
                }
            ],
            customer_email: req.user.email,
            metadata: {
                discordId: req.user.id
            },
            success_url: process.env.FRONTEND + `/manage?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.FRONTEND + `/manage`
        });

        res.send({
            sessionId: session.id
        });
    } catch (e) {
        res.status(400);
        return res.send({
            error: {
                message: e.message
            }
        });
    }
});

router.post('/customer-portal', hasToken, async (req, res) => {
    const session = await stripe.billingPortal.sessions.create({
        customer: 'cus_IDaJ3iSNMoDbmA',
        return_url: process.env.FRONTEND + '/manage'
    });

    res.send({
        url: session.url
    });
});

router.post('/webhook', async (req, res) => {
    let eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error(`⚠️  Webhook signature verification failed.`, err);
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === 'checkout.session.completed') {
        await database.Customers.update({
            stripeCustomerId: data.object.customer,
            premium: true
        }, {
            where: {
                id: data.object.metadata.discordId
            }
        });
    }

    if (eventType === 'invoice.payment_failed') {
        await database.Customers.update({
            premium: false
        }, {
            where: {
                id: data.object.metadata.discordId
            }
        });
    }

    if (eventType === 'customer.subscription.deleted') {
        await database.Customers.update({
            premium: false
        }, {
            where: {
                id: data.object.metadata.discordId
            }
        });
    }

    res.sendStatus(200);
});

module.exports = router;