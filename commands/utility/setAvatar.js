const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	global: true,
	data: new SlashCommandBuilder()
		.setName('set_avatar')
		.setDescription('Update the bots user image')
		.addAttachmentOption(option =>
			option.setName('image')
			.setDescription('Image to use')
			.setRequired(true)),
	async execute(interaction) {
		if(!['222457277708369928'].includes(interaction.member.id)) {
			await interaction.reply("Insufficient permissions!");
			return;
		}

		await interaction.client.user.setAvatar(interaction.options.getAttachment('image').url);
		await interaction.reply("Updated avatar");
	},
};