const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	global: true,
	data: new SlashCommandBuilder()
		.setName('grab')
		.setDescription('Grab things')
		.addSubcommand(subcommand =>
			subcommand
				.setName('emotes')
				.setDescription('Get the emote as an image')
				.addStringOption(option =>
					option.setName('emote')
						.setRequired(true)
						.setDescription('The emote to grab'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('sticker')
				.setDescription('Get the sticker as an image')
		),
	async execute(interaction) {
		let reply = "";

		switch (interaction.options.getSubcommand()) {
			case 'emote':
				reply = this.grabEmotes(interaction);
				break;
			case 'sticker':
				reply = 'Please send a sticker message';
				this.grabSticker(interaction);
				break;
			default:
				break;
		}

		await interaction.reply(reply);
	},

	grabEmotes: function (interaction) {
		let emotes = interaction.options.get('emote').value.split('<');
		let images = [];

		emotes.forEach(emote => {
			//Static emotes
			if ((emote.startsWith(':') || emote.startsWith('a')) && emote.endsWith('>')) {
				let emoteId = emote.split(':')[2].slice(0, -1);
				let type = emote.startsWith(':') ? 'png' : 'gif';
				images.push(`https://cdn.discordapp.com/emojis/${emoteId}.${type}`);
			}
		});

		let reply = images.join('\n');
		return reply != '' ? reply : "Hmm, couldn't parse any emotes <:GudaEhehe:810677374059544617>";
	},

	grabSticker: async function (interaction) {
		const collectorFilter = m => (m.author.id = interaction.member.id) && (m.channel.id == interaction.channel.id);
		const collector = interaction.channel.createMessageCollector({ filter: collectorFilter, time: 60_000 });

		let stickers = []

		collector.on('collect', m => {
			m.stickers.forEach(sticker => {
				stickers.push(`https://media.discordapp.net/stickers/${sticker.id}.png?size=1024`);
				collector.stop();
			});
		});

		collector.on('end', collected => {
			interaction.channel.send(stickers.length > 0 ? stickers.join('\n') : "Didn't receive any stickers");
		});
	}
};
