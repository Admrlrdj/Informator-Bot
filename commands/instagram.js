import {
    SlashCommandBuilder,
    MessageFlags,
    EmbedBuilder
} from 'discord.js'
import axios from 'axios'
const IG_USERNAME = 'infantryvokasi'
const DISCORD_CHANNEL_ID = '1449389549842202778'
const ROLE_ID = '1449385749303656560'
let lastPostShortcode = ''

export default {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi secara manual'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        })

        try {
            const options = {
                method: 'POST',
                url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                headers: {
                    'x-rapidapi-key': '20169fe4d0msha587848458b92e5p1c5de7jsn37141c641f8d',
                    // 'x-rapidapi-key': process.env.RAPID_API_KEY,
                    'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                data: {
                    username: IG_USERNAME,
                    maxId: ''
                }
            }

            const response = await axios.request(options)
            const posts = response.data.result && response.data.result.edges ? response.data.result.edges : []

            if (posts.length > 0) {
                const latestPost = posts[0].node
                const shortcode = latestPost.code
                const postUrl = `https://www.instagram.com/p/${shortcode}/`
                const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url

                const targetChannel = await interaction.client.channels.fetch(DISCORD_CHANNEL_ID)

                if (targetChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#E1306C')
                        .setDescription(latestPost.caption?.text || "Update baru!")
                        .setImage(imageUrl)
                        .setTimestamp()
                        .setFooter({
                            text: `Instagram • @${IG_USERNAME}`
                        })

                    await targetChannel.send({
                        content: `Halo <@&${ROLE_ID}>! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                        embeds: [embed]
                    })

                    await interaction.editReply(`✅ Berhasil! Notif dikirim ke <#${DISCORD_CHANNEL_ID}>`)
                }
            } else {
                await interaction.editReply('❌ Gagal: Tidak ada postingan ditemukan.')
            }
        } catch (error) {
            console.error('RapidAPI Error:', error.message)
            await interaction.editReply(`❌ Gagal: ${error.message}`)
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram @${IG_USERNAME} aktif untuk Role: ${ROLE_ID}`)

        const fetchInitialState = async () => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                    headers: {
                        'x-rapidapi-key': '20169fe4d0msha587848458b92e5p1c5de7jsn37141c641f8d',
                        // 'x-rapidapi-key': process.env.RAPID_API_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    data: {
                        username: IG_USERNAME,
                        maxId: ''
                    }
                }
                const response = await axios.request(options)
                const posts = response.data.result?.edges || []
                if (posts.length > 0) {
                    lastPostShortcode = posts[0].node.code
                    console.log(`✅ Berhasil mencatat post terakhir (${lastPostShortcode}). Bot standby menunggu upload baru.`)
                }
            } catch (err) {
                console.error('⚠️ Init IG Error:', err.message)
            }
        }

        fetchInitialState()

        setInterval(async () => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                    headers: {
                        'x-rapidapi-key': '20169fe4d0msha587848458b92e5p1c5de7jsn37141c641f8d',
                        // 'x-rapidapi-key': process.env.RAPID_API_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    data: {
                        username: IG_USERNAME,
                        maxId: ''
                    }
                }

                const response = await axios.request(options)
                const posts = response.data.result?.edges || []

                if (posts.length > 0) {
                    const latestPost = posts[0].node
                    const shortcode = latestPost.code

                    if (shortcode && shortcode !== lastPostShortcode && lastPostShortcode !== '') {
                        lastPostShortcode = shortcode

                        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID)
                        if (channel) {
                            const postUrl = `https://www.instagram.com/p/${shortcode}/`
                            const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url

                            const embed = new EmbedBuilder()
                                .setColor('#E1306C')
                                .setDescription(latestPost.caption?.text || "Update baru!")
                                .setImage(imageUrl)
                                .setTimestamp()
                                .setFooter({
                                    text: `Instagram • @${IG_USERNAME}`
                                })

                            await channel.send({
                                content: `Halo <@&${ROLE_ID}>! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                                embeds: [embed]
                            })
                            console.log(`🆕 Notif terkirim untuk postingan: ${shortcode}`)
                        }
                    }
                }
            } catch (err) {
                console.error('⚠️ Monitor IG Error:', err.message)
            }
        }, 2700000) // Cek setiap 45 menit
    }
}