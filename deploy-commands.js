const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const guildCommands = [];
const globalCommands = [];

// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			if (command.global)
				globalCommands.push(command.data.toJSON());
			else {
				guildCommands.push(command.data.toJSON());
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`[GUILD] Started refreshing ${guildCommands.length} application (/) commands.`);

		let data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: guildCommands },
		);

		console.log(`[GUILD] Successfully reloaded ${data.length} application (/) commands.`);

		console.log(`[GLOBAL] Started refreshing ${globalCommands.length} application (/) commands.`);

		data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: globalCommands },
		);

		console.log(`[GLOBAL] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();