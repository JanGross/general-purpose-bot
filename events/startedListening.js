const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {

        let client = newPresence.client;
        let subscribers = {
            '442059309581336578': { role: '1217094285397200896' }
        }

        let debugChannel = await client.channels.fetch('1171410849269809232');

        let guild = newPresence.guild;
        let member = newPresence.member;

        let isListening = false;
        for (let i = 0; i < newPresence.activities.length; i++) {
            if (newPresence.activities[i].name == "Spotify") {
                isListening = true;
            }
        }

        if (isListening) {
            if (guild.id in subscribers) {
                {
                    let role = guild.roles.cache.get(subscribers[guild.id]['role']);
                    console.log(`[ROLE] Assigning listen role to ${member.displayName} in ${guild.name}`);
                    await member.roles.add(role);
                }
            } else {
                if (guild.id in subscribers) {
                    let role = guild.roles.cache.get(subscribers[guild.id]['role']);

                    if (member.roles.cache.has(role)) {
                        console.log(`[ROLE] Removing listen role from ${member.displayName} in ${guild.name}`);
                        await member.roles.remove(role);
                    }

                }
            }
        }
    }
};