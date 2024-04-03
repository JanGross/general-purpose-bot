const { Events, Partials } = require('discord.js');
const axios = require('axios').default;
const { lfmKey } = require('../config.json');

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

		let reply = `${user.displayName} rated **${title}** with ${reaction._emoji.toString()}`;
		if(title.startsWith('https://')) {
			title = `<${title}>`;
		}
		
		let db = await reaction.client.localDB;
		let dbResult = await db.get(`SELECT * FROM lastfm WHERE discord_id = ?`,[user.id]);
		let lfmUsername = dbResult?.['lastfm_name'];
		if (lfmUsername) {
			let songName = title.split(' - ')[0];
			let artistName = title.split(' - ').slice(1);
			let lfmData = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${lfmKey}&artist=${artistName}&track=${songName}&format=json&user=${lfmUsername}`);
			if (lfmData.data['track']?.['userplaycount'] > 0) {
				reply = `${reply}\nAfter listening ${lfmData.data['track']?.['userplaycount']} times`;
			}
		}
		



		await reaction.message.channel.send({ 
			content: reply,
			reply: { messageReference: reaction.message.id }
		});
	},
};