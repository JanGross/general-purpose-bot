const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { spotify, lfmKey } = require('../../config.json');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios').default;

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
				option.setName('scrobbles_override')
				.setDescription('Override your scrobble count. Otherwise fetches from LFM (use /lfm link to add account)')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('artist')
				.setDescription('Override artist, otherwise uses artist from Spotify')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('songname')
				.setDescription('Override song name, otherwise uses name from Spotify')
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
		let description = ' ';
		let spotifyID = null;
		let artists = '';
		let songName = '';
		let mainArtist = '';
		
		const trackEmbed = new EmbedBuilder()
		.setColor(Math.floor(Math.random() * 16777214) + 1)
		.setDescription(`asdasdasda`)
		.setTimestamp();
		
		let links = [];
		for (let index = 0; index < urls.length; index++) {
			let url = urls[index];

			if (url.startsWith('https://listen.minzkraut.com/')) {
				links.push(`[<:drmoe:1220702607836839956> Navidrome ](${url})`);
				continue;
			}
			if (url.startsWith('https://open.spotify.com/')) {
				url = url.split('?')[0];
				links.push(`[<:sptfy:1224677302109995078> Spotify ](${url})`);
				//https://open.spotify.com/track/4FuOHRPC3ZIQ7VQd7KMbds?si=cadd634ea5a14689
				spotifyID = url.split('/').pop();
				continue;
			}
			if (url.startsWith('https://listen.tidal.com/')) {
				links.push(`[<:tidal:1221732946525032498> Tidal ](${url})`);
				continue;
			}
			if (url.startsWith('https://www.youtube.com/')) {
				links.push(`[<:ytbm:1224704771248750622>  Youtube ](${url})`);
				continue;
			}
		}
		
		
		if(spotifyID) {
			let spotifyTrack = await this.spotifyAPI.getTrack(spotifyID);
			trackEmbed.setImage(spotifyTrack['body'].album.images[0].url);
			songName = spotifyTrack['body'].name;
			mainArtist = spotifyTrack['body'].artists[0].name;
			artists = spotifyTrack['body'].artists.map(a => a.name).join(', ');
			let releaseDate =  new Date(spotifyTrack['body'].album.release_date).toDateString();
			description = `From the album **${spotifyTrack['body'].album.name}**\nReleased **${releaseDate}**\n\n` + description;
		}
		
		if(interaction.options.getAttachment('cover_override')) {
			trackEmbed.setImage(interaction.options.getAttachment('cover_override').url);
		}
		songName = interaction.options.getString('songname', false) ?? songName;
		artists = interaction.options.getString('artist', false) ?? artists;
		mainArtist = interaction.options.getString('artist', false) ?? mainArtist;
		
		title = `${songName} - ${artists}`;

		trackEmbed.setTitle(`${title}`);

		let submitterName = interaction.member.displayName;
		let footer = interaction.options.getString('footer_override', false) ?? `Submitted by ${submitterName}`;
		trackEmbed.setFooter({text: footer });
		
		if(interaction.options.getString('rating', false)) {
			trackEmbed.addFields(
				{ name: `${submitterName} rated this`, value: `${interaction.options.getString('rating', false)} out of 10`, inline: true },
			)
		}

		let db = await interaction.client.localDB;
		let dbResult = await db.get(`SELECT * FROM lastfm WHERE discord_id = ?`,[interaction.member.id]);
		let lfmUsername = dbResult?.['lastfm_name'];
		let lfmData = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${lfmKey}&artist=${mainArtist}&track=${songName}&format=json&user=${lfmUsername}`);

		if(interaction.options.getInteger('scrobbles', false) || lfmData.data['track']?.['userplaycount'] > 0) {
			trackEmbed.addFields(
				{ name: `${submitterName} scrobbled this`, value: `${interaction.options.getInteger('scrobbles', false) ?? lfmData.data['track']['userplaycount']} times so far`, inline: true },
			)
		} 

		if(lfmData.data['track']) {
			links.push(`<:lfm:1225099203039203338> [View on LFM](${lfmData.data['track']['url']})`);
			let tags = lfmData.data['track']['toptags']['tag'].map(a => a.name).filter(tag => tag.length >= 2);
			console.log(tags);
			let listeners = this.numToHumanReadable(lfmData.data['track']['listeners']);
			let globalScrobbles = this.numToHumanReadable(lfmData.data['track']['playcount']);

			trackEmbed.addFields(
				{ name: `LFM Global`, value: `Listeners: ${listeners} • Scrobbles: ${globalScrobbles}\n`, inline: false },
			)

			let tagHeader = 'Tags';
			if(tags.length === 0) {
				//artist tag fallback
				let lfmArtistTags = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getTopTags&api_key=${lfmKey}&artist=${mainArtist}&format=json`);
				console.log(lfmArtistTags);
				tags = lfmArtistTags.data['toptags']['tag'].map(a => a.name);
				tagHeader = `Artist ${tagHeader}`;
			}
			if(tags) {
				tags = this.joinLineBreak(tags, ', ', 4);
				trackEmbed.addFields(
					{ name: `${tagHeader}`, value: `${tags.substr(0,60)}${tags.length > 60 ? '...' : ''}`, inline: true },
				)
			}
		}

		description = `${description}\n${this.joinLineBreak(links, ' ∘ ', 3)}`

		if(!description) {
			await interaction.reply({content: 'Sorry, no valid link has bee supplied.', ephemeral: true });
			return;
		}

		trackEmbed.setDescription(description);
		
        interaction.channel.send({ embeds: [trackEmbed] });

		let response = await interaction.reply({content: 'done', ephemeral: true});
		await response.delete();
	},
	numToHumanReadable: function(num) {
		if (num > 1000000 ) {
			return `${(num/1000000).toFixed(1)}M`;
		}
		if (num > 1000 ) {
			return `${(num/1000).toFixed(1)}K`;
		}
		return num;
	},
	joinLineBreak: function(arr, joinChar, n) {
		let groupedArray = [];
		for (let index = 0; index < arr.length; index += n) {
			let joined = index + n < arr.length ? arr.slice(index,index+n).join(joinChar) : arr.slice(index).join(joinChar);	
			groupedArray.push(joined);
		}
		return groupedArray.join('\n');
	}
};