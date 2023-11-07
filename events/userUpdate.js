const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	name: Events.UserUpdate,
	async execute(oldMember, newMember) {

        let client = newMember.client;
        let debugChannel =  await client.channels.fetch('1171410849269809232');

        let notifyList = [
            { guild: '837807020618023002', channel: '938462252720328715' }
        ]

		if(oldMember.avatarURL() !== newMember.avatarURL()) {
            console.log(`[USER] ${oldMember.displayName} changed their avatar`);
            const newAvatar = new AttachmentBuilder(newMember.avatarURL({ size: 1024 }), { name: 'new.webp' });

            const notificationEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Avatar changed')
                .setDescription(`${newMember.displayName} changed their avatar`)
                .setImage('attachment://new.webp')
                .setTimestamp();

            debugChannel.send({ embeds: [notificationEmbed], files: [newAvatar] });

            for (const subscriber of notifyList) {
                let guild = await client.guilds.fetch(subscriber['guild']);
                if (guild.members.cache.has(newMember.id)) {
                    console.log(`[NOTIFY] Sending avatar notification for ${newMember.displayName} to ${guild.name}`);
                    await (await client.channels.fetch(subscriber['channel'])).send({ embeds: [notificationEmbed], files: [newAvatar] });
                }
            }
        }

		if(oldMember.globalName !== oldMember.globalName) {
            console.log(`[USER] ${oldMember.displayName} changed their name to ${newMember.displayName}`);   
        }
	},
};