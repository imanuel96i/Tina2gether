require('dotenv').config()
const fs = require('fs')
const { Client, Intents, Collection } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const { DiscordTogether } = require('discord-together');
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const RSS = require('./activitys/rss')

client.discordTogether = new DiscordTogether(client)

const commandFiles = fs.readdirSync(__dirname +'/commands').filter(file => file.endsWith('.js'))

const commands = []

client.commands = new Collection()

for (const file of commandFiles){
    const command = require(__dirname +`/commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
}

client.on('messageCreate', async message => {
    if (message.content === '-help') {
        message.reply(`** Se han actualizado los comandos por comandos con el /**\n` +
            '**Puedes hechar un vistazo a los comandos via / con una breve descripcion de estos!**')
    }
})

client.on('ready', client => {
    client.user.setActivity('Use -help to provide information')
    RSS.AutoRSS(client)
    
    const CLIENT_ID = client.user.id

    const rest = new REST({
        version: '9'
    }).setToken(process.env.TOKEN);

    (async () =>{
        try{
            if (process.env.ENV === 'production'){
                await rest.put(Routes.applicationCommands(CLIENT_ID),{
                    body: commands
                })
                console.log('Se añadieron correctamente los comandos globales')
            } else {
                await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                    body: commands
                })
                console.log('Se añadieron correctamente los comandos locales')
            }
        } catch (err){
            if (err) console.error(err)
        }
    })();
})

client.on('interactionCreate', async interaction =>{
    if(!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)
    if(!command) return

    try{
        await command.execute(interaction)
    } catch(err){
        if (err) console.error(err)

        await interaction.reply({
            content: 'A ocurrido un error cuando se trato de ejecutar el comando',
            ephemeral: true
        })
    }
})

client.login(process.env.TOKEN)