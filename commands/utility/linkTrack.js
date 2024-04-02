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
			option.setName('title_override')
				.setDescription('Custom title, otherwise uses title from Spotify')
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
		.setColor(0x0099FF)
		.setDescription(`asdasdasda`)
		.setFooter({text:`Submitted by ${interaction.member.displayName}`})
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
			console.log(spotifyTrack);
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

		if(!description) {
			await interaction.reply({content: 'Sorry, no valid link has bee supplied.', ephemeral: true });
			return;
		}

		trackEmbed.setDescription(description);
		
        interaction.channel.send({ embeds: [trackEmbed] });

		let response = await interaction.reply({content: 'done', ephemeral: true});
//		await response.delete();
	},
};