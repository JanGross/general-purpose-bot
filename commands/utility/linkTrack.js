const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { spotify } = require('../../config.json');
const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
	category: 'utility',
	global: true,
	data: new SlashCommandBuilder()
		.setName('link_track')
		.setDescription('Generate embed with music links')
		.addStringOption(option =>
			option.setName('links')
				.setDescription('Links separated by space')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('rating')
			.setDescription('Optionally provide your rating')
			.setRequired(false)
			.addChoices(
				{ name: '1', value: '<:1:1221744574897197097>' },
				{ name: '2', value: '<:2:1221744576751075398>' },
				{ name: '3', value: '<:3:1221744578273607680>' },
				{ name: '4', value: '<:4:1221744638574989385>' },
				{ name: '5', value: '<:5:1221744581670993970>' },
				{ name: '6', value: '<:6:1221744566890266667>' },
				{ name: '7', value: '<:7:1221744568202956800>' },
				{ name: '8', value: '<:8:1221744569406717954>' },
				{ name: '9', value: '<:9_:1221744570531053620>' },
				{ name: '10', value: '<:10:1221744572326215680>' },
			))
		.addIntegerOption(option =>
				option.setName('scrobbles')
				.setDescription('Your scrobble count at the time of submission')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('title_override')
				.setDescription('Custom title, otherwise uses title from Spotify')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('footer_override')
				.setDescription('Custom footer')
				.setRequired(false))
		.addAttachmentOption(option =>
			option.setName('cover_override')
			.setDescription('Uses this image instead of Spotofy metadata')
			.setRequired(false)),
	spotifyAPI: new SpotifyWebApi({
		clientId: spotify.clientID,
		clientSecret: spotify.clientSecret,
	}),
	async execute(interaction) {
		let token = await this.spotifyAPI.clientCredentialsGrant().then(
			function(data) {
			  return data.body['access_token'];
			});
		await this.spotifyAPI.setAccessToken(token);

		let urls = interaction.options.getString('links', true).split(" ");
		
		let title = ' ';
		let description = '';
		let spotifyID = null;
		
		const trackEmbed = new EmbedBuilder()
		.setColor(Math.floor(Math.random() * 16777214) + 1)
		.setDescription(`asdasdasda`)
		.setTimestamp();
		
		for (let index = 0; index < urls.length; index++) {
			let url = urls[index];

			if (url.startsWith('https://listen.minzkraut.com/')) {
				description += `[<:drmoe:1220702607836839956> Navidrome](${url})  `
				continue;
			}
			if (url.startsWith('https://open.spotify.com/')) {
				url = url.split('?')[0];
				description += `[<:sptfy:1224677302109995078> Spotify](${url})  `;
				//https://open.spotify.com/track/4FuOHRPC3ZIQ7VQd7KMbds?si=cadd634ea5a14689
				spotifyID = url.split('/').pop();
				continue;
			}
			if (url.startsWith('https://listen.tidal.com/')) {
				description += `[<:tidal:1221732946525032498> Tidal](${url})  `
				continue;
			}
			if (url.startsWith('https://www.youtube.com/')) {
				description += `[<:ytbm:1224704771248750622>  Youtube](${url})  `
				continue;
			}

		}
		
		
		
		if(spotifyID) {
			let spotifyTrack = await this.spotifyAPI.getTrack(spotifyID);
			trackEmbed.setImage(spotifyTrack['body'].album.images[0].url);
			title = `${spotifyTrack['body'].name} - ${spotifyTrack['body'].artists.map(a => a.name).join(', ')}`;
			let releaseDate =  new Date(spotifyTrack['body'].album.release_date).toDateString();
			description = `From the album **${spotifyTrack['body'].album.name}**\nReleased **${releaseDate}**\n\n` + description;
		}
		
		if(interaction.options.getAttachment('cover_override')) {
			trackEmbed.setImage(interaction.options.getAttachment('cover_override').url);
		}

		title = interaction.options.getString('title_override', false) ?? title;
		trackEmbed.setTitle(`${title}`);

		let submitterName = interaction.member.displayName;
		let footer = interaction.options.getString('footer_override', false) ?? `Submitted by ${submitterName}`;
		trackEmbed.setFooter({text: footer });
		
		if(interaction.options.getString('rating', false)) {
			trackEmbed.addFields(
				{ name: `${submitterName} rated this`, value: `${interaction.options.getString('rating', false)} out of 10`, inline: true },
			)
		}

		if(interaction.options.getInteger('scrobbles', false)) {
			trackEmbed.addFields(
				{ name: `${submitterName} scrobbled this`, value: `${interaction.options.getInteger('scrobbles', false)} times so far`, inline: true },
			)
		}

		if(!description) {
			await interaction.reply({content: 'Sorry, no valid link has bee supplied.', ephemeral: true });
			return;
		}

		trackEmbed.setDescription(description);
		
        interaction.channel.send({ embeds: [trackEmbed] });

		let response = await interaction.reply({content: 'done', ephemeral: true});
		await response.delete();
	},
};