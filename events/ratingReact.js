const { Events, Partials } = require('discord.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction, user) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error('Reacted message can not be fecthed:', error);
				return;
			}
		}

		let channelWhitelist = [
			'1220653860251762688', //musik hier
			'1221748800671191050', //track der woche
			'1220685344341757952', //playlists
			'1159103323018891264' //test
		];

		if(!channelWhitelist.includes(reaction.message.channel.id)) {
			return;
		}

		let title = 'Unknown';
		if(reaction.message.author.id == "816228963285860373") {
			title = reaction.message.embeds[0].title;
		} else {
			console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
			title = reaction.message.content.split("\n")[0];
		}

		if(title.startsWith('https://')) {
			title = `<${title}>`;
		}

		await reaction.message.channel.send({ 
			content: `${user.displayName} rated **${title}** with ${reaction._emoji.toString()}`,
			reply: { messageReference: reaction.message.id }
		});
	},
};