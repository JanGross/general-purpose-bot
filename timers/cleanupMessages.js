const { MessageActivityType } = require("discord.js");

module.exports = {
	timeout: 60000,
    immediate: true,
	name: 'Cleanup tasks',
	async tick(client, timer) {
        const keepMessageEmoteId = '1214140438265724980';
        const channelConfigs = [
            { channelId: '1214134516247957504', keepTimeMinutes: 2, keepAttachment: true }, //toho-test/mnzbot-test
            { channelId: '1111054421091155978', keepTimeMinutes: 2880 }, //cotr/Spam
            { channelId: '1170190197384814762', keepTimeMinutes: 2880, keepAttachment: true }, //cotr/Red
            { channelId: '1101703550070947920', keepTimeMinutes: 2880, keepAttachment: true }, //cotr/Memes
        ];
        function isMessageLocked(message) {
            for(const [id, reaction] of message.reactions.cache) {
                if(id === keepMessageEmoteId) {
                    return true;
                }
            }

            return false;
        }

        for (let i = 0; i < channelConfigs.length; i++) {
            const config = channelConfigs[i];
            const channel = await client.channels.fetch(config.channelId);
    
            console.log(`[TIMER] Running cleanup task for ${channel.guild.name}/${channel.name}`);
            channel.messages.fetch({ limit: 100 }).then(messages => {
                messages.forEach(message => {
                    if(isMessageLocked(message)) {
                        //skip if message has mnzboKeepMessage reaction
                        console.log(`[LOCKED] [${message.guild.name}/${message.channel.name}] | ${message.author.globalName}: ${message.content}`);
                        return;
                    }                    

                    if(message.attachments.size > 0 && config.keepAttachment) {
                        //Skip messages with attachment
                        return;
                    }
                    
                    let ageInMinutes = Math.ceil((Date.now() - message.createdTimestamp) / 1000 / 60);
                    if(ageInMinutes < config.keepTimeMinutes) {
                        //Skip messages posted within last 48 Hours
                        return;
                    }
                    
                    console.log(`[CLEANUP] [${message.guild.name}/${message.channel.name}] | ${message.author.globalName}: ${message.content}`);
                    message.delete();
                });
            });
        }
	},
};