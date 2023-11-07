const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		console.log(`[${message.channel.guild.name}/${message.channe.name}]${message.author.globalName}: ${message.content}`);
	},
};