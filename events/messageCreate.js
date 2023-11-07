const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		console.log(`${message.author.globalName}: ${message.content}`);
	},
};