module.exports = {
	timeout: 60000,
    immediate: true,
	name: 'Cleanup tasks',
	async tick(client, timer) {
        const channelId = '1111054421091155978';
        const channel = await client.channels.fetch(channelId);

        console.log(`[TIMER] Running cleanup task for ${channel.guild.name}/${channel.name}`);
        channel.messages.fetch({ limit: 100 }).then(messages => {
            //Iterate through the messages here with the variable "messages".
            messages.forEach(message => {
                let ageInMinutes = Math.ceil((Date.now() - message.createdTimestamp) / 1000 / 60);
                if(ageInMinutes < 2880) {
                    //Skip messages posted within last 48 Hours
                    return;
                }
                
                console.log(`[CLEANUP] [${message.guild.name}/${message.channel.name}] | ${message.author.globalName}: ${message.content}`);
                message.delete();
            });
        });
	},
};