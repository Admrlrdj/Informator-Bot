const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778';
const ROLE_ID = 'a';
let lastPostShortcode = '1449385749303656560';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi secara manual'),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            const options = {
                method: 'POST',
                url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                data: { username: IG_USERNAME, maxId: '' }
            };

            const response = await axios.request(options);
            const posts = response.data.result?.edges || [];
            
            if (posts.length > 0) {
                const latestPost = posts[0].node;
                const shortcode = latestPost.code;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;
                const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url;

                const targetChannel = await interaction.client.channels.fetch(DISCORD_CHANNEL_ID);
                
                if (targetChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#E1306C')
                        .setDescription(latestPost.caption?.text || "No caption")
                        .setImage(imageUrl)
                        .setTimestamp();

                    await targetChannel.send({
                        content: `Halo <@&${ROLE_ID}>! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                        embeds: [embed]
                    });

                    await interaction.editReply(`✅ Berhasil! Tag dikirim ke <#${DISCORD_CHANNEL_ID}>`);
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
            await interaction.editReply(`❌ Gagal: ${error.message}`);
        }
    },

    init: (client) => {
        const fetchCurrentState = async () => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    data: { username: IG_USERNAME, maxId: '' }
                };
                const response = await axios.request(options);
                const posts = response.data.result?.edges || [];
                if (posts.length > 0) {
                    lastPostShortcode = posts[0].node.code;
                }
            } catch (err) {
                console.error('⚠️ Init error:', err.message);
            }
        };

        fetchCurrentState();

        setInterval(async () => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    data: { username: IG_USERNAME, maxId: '' }
                };

                const response = await axios.request(options);
                const posts = response.data.result?.edges || [];

                if (posts.length > 0) {
                    const latestPost = posts[0].node;
                    const shortcode = latestPost.code;

                    if (shortcode !== lastPostShortcode && lastPostShortcode !== '') {
                        lastPostShortcode = shortcode;
                        
                        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                        if (channel) {
                            const postUrl = `https://www.instagram.com/p/${shortcode}/`;
                            const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url;

                            const embed = new EmbedBuilder()
                                .setColor('#E1306C')
                                .setDescription(latestPost.caption?.text || "No caption")
                                .setImage(imageUrl)
                                .setTimestamp();

                            await channel.send({
                                // MENTION ROLE DISINI JUGA
                                content: `Halo <@&${ROLE_ID}>! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                                embeds: [embed]
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('⚠️ IG Monitor Error:', err.message);
            }
        }, 60000); 
    }
};