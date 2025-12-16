require('dotenv').config();
const {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`⚠️ Gagal menjalankan command ${interaction.commandName}:`, error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '❌ Terjadi kesalahan saat menjalankan perintah ini.',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat menjalankan perintah ini.',
                ephemeral: true
            });
        }
    }
});

client.once(Events.ClientReady, async c => {
    console.log(`✅ Bot login sebagai ${c.user.tag}`);

    const igNotifier = require('./commands/instagram.js');
    if (igNotifier && typeof igNotifier.init === 'function') {
        igNotifier.init(client);
    }

    const ownerId = process.env.OWNER_ID;
    const readyAt = c.readyAt;

    const waktuDM = readyAt.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    try {
        const user = await client.users.fetch(ownerId);
        await user.send(`✅ Bot **${c.user.tag}** berhasil aktif pada ${waktuDM}.`);
    } catch (err) {
        console.error('❌ Gagal kirim DM ke owner');
    }
});

client.login(process.env.TOKEN);