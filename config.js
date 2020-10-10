module.exports = {
    prefix: 'e!',
    rawEvents: {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    },
    emojiDecision: {
        tick: 'Going',
        cross: 'Not Going',
        question: 'Unsure'
    },
    redisPrefix: 'eventBot'
};