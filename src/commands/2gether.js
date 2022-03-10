require('dotenv').config()
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Client, Intents, Collection } = require('discord.js')
const { DiscordTogether } = require('discord-together');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

client.discordTogether = new DiscordTogether(client)
client.login(process.env.TOKEN)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('w2gether')
        .setDescription('Crea un link para iniciar 2gether. Recuerda copiar el id del canal donde deseas activar el 2gether')
        .addStringOption((option) =>
            option
                .setName('channelid')
                .setDescription('Id del canal para generar el link')
                .setRequired(true)
        ),
    async execute(interaction) {
        twogether(interaction.options.getString('channelid')).then((response) => {
            interaction.reply({
                content: response
            })
        })
        .catch((err) => {
            interaction.reply({
                content: err
            })
        })
    }
}

const twogether = (id) => {
    return new Promise((res, rej) => {
        let check = /^\d+$/.test(id);
        if (check) {
            client.discordTogether.createTogetherCode(id, 'youtube').then(async invite => {
                return res(invite.code)
            })
        } else {
            return rej('Recuerda añadir el id del canal de voz al que deseas iniciar el 2gether')
        }
    })
}
