const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		console.log(`[${message.guild.name}/${message.channel.name}]${message.author.globalName}: ${message.content}`);
	},
};