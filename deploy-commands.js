require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
    REST,
    Routes
} = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.TOKEN);
const APPLICATION_ID = process.env.APPLICATION_ID;
const SERVER_ID = process.env.SERVER_ID;

(async () => {
    try {
        console.log('🚀 Men-deploy command ke server Infantruy Vokasuy...');
        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, SERVER_ID), {
                body: commands
            }
        );
        console.log('✅ Command berhasil didaftarkan ke Infantruy Vokasuy!');
    } catch (error) {
        console.error('❌ Error saat deploy:', error);
    }
})();