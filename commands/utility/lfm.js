const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { spotify } = require('../../config.json');
const SpotifyWebApi = require('spotify-web-api-node');
const https = require('https');

module.exports = {
	category: 'utility',
	global: true,
	data: new SlashCommandBuilder()
		.setName('lfm')
		.setDescription('LastFM interactions')
		.addSubcommand(subcommand =>
			subcommand
				.setName('link')
				.setDescription('Link your LastFM username')
				.addStringOption(option =>
					option.setName('username')
						.setRequired(true)
						.setDescription('Your username'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('Show your name as it is set in the database')
		),
	async execute(interaction) {
		let db = await interaction.client.localDB;
		let discordId = interaction.member.id;
		switch (interaction.options.getSubcommand()) {
			case 'link':
				let lastFmName = interaction.options.get('username').value;
				db.run(`INSERT OR REPLACE INTO lastfm (discord_id, lastfm_name) VALUES (?,?)` ,[discordId, lastFmName]);
				interaction.reply('Set username');
				break;
			case 'show':
				let lfmName = await db.get(`SELECT * FROM lastfm WHERE discord_id = ?`,[discordId]);
				interaction.reply(JSON.stringify(lfmName) ?? 'No usrename on record');
				break
			default:
				break;
		}
	},
};