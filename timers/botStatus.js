const { ActivityType } = require('discord.js');

module.exports = {
	timeout: 5 * 60 * 1000,
    immediate: true,
	name: 'Bot Status',
    data: {
        statusIndex: 0,
        animeList: ["K-On!", "Spice and Wolf", "Bakemonogatari", "Your Lie in April", "Noragami", "Puella Magi Madoka Magica", "Akame ga Kill!", "Steins;Gate", "\u3086\u308b\u30ad\u30e3\u30f3\u25b3"]
    },
	async tick(client, timer) {
        client.user.setActivity(timer.data.animeList[timer.data.statusIndex], { type: ActivityType.Watching });
        timer.data.statusIndex = (timer.data.statusIndex + 1) % timer.data.animeList.length
	},
};