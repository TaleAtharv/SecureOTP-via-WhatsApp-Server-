module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/members/verify',
            handler: 'member.verify'
        }
    ],
};