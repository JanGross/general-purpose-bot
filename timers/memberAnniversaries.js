const db = require("../core/db");


async function fetchAnniversary(id) {
    console.log(await db);
    let query = await db.prepare(`SELECT * FROM anniversaries WHERE discord_id = ?`)
    return await query.get(id);
}

function insertNewMember(member) {
    db.run(
        `INSERT INTO anniversaries (name, guild_id, discord_id, last_anniversary_notification) VALUES (?, ?, ?, ?)`,
        [member.user.username, member.guild.id, member.id, Date.now()],
        function (error) {
            if (error) {
                console.error(error.message);
            }
            console.log(`Inserted a row with the ID: ${this.lastID}`);
        }
    );
}

function isAnniversary(date) {
    const now = new Date("Thu Nov 11 2024");// new Date();
    console.log(`${date.getDate()} - ${now.getDate()}`);
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
}

function getTimeSince(date) {
    const now = new Date();
    const diff = now - date; // `date` is already a Date object

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} years ago`;
    if (months > 0) return `${months} months ago`;
    if (weeks > 0) return `${weeks} weeks ago`;
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return `${seconds} seconds ago`;
}

module.exports = {
    timeout: 60000,
    immediate: true,
    name: 'Daily member anniversary check',

    async tick(client, timer) {
        return;
        console.log(`[TIMER] Anniversary Check`);
        let debugChannel = await client.channels.fetch('1214134516247957504');

        let subscribedChannels = [
            { guild: '442059309581336578', channel: '1214134516247957504' } //toho-test
        ]

        for (let channelIndex = 0; channelIndex < subscribedChannels.length; channelIndex++) {
            const guild = await client.guilds.fetch(subscribedChannels[channelIndex].guild);
            const channel = await client.channels.fetch(subscribedChannels[channelIndex].channel);
            let guildMembers = await guild.members.fetch();
            guildMembers.forEach(member => {
                if(isAnniversary(member.joinedAt)) {
                    //debugChannel.send(`Upcoming anniversary ${member.displayName} ${member.joinedAt} ${getTimeSince(member.joinedAt)}`);
                    console.log(`User anniversary ${member.displayName} ${member.joinedAt} ${getTimeSince(member.joinedAt)}`);
                    let dbEntry = fetchAnniversary(member.id);
                    console.log(dbEntry);
                }
            });
        }
    },
};