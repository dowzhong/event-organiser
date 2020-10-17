module.exports = {
    prefix: 'e!',
    rawEvents: {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    },
    emojiDecision: {
        '764105743644622868': 'Going',
        '764105743539765278': 'Not Going',
        '764105743351021569': 'Unsure',
    },
    redisPrefix: 'eventBot',
    colors: {
        active: 0x99EEBB,
        expired: 0x2c2f33,
        example: 0xC0C0C0,
        orangeError: 0xff781f,
        redError: 0xff0033
    },
    botMessageTimeout: 1000 * 60 * 2,
    premiumPlanId: 'price_1Hd7x7GWiTk0G7fDEgkpsJ55'
};