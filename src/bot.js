require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })
const { DiscordTogether } = require('discord-together');
const Parser = require('rss-parser')
const CronJob = require('cron').CronJob
const Database = require('./db')
const parser = new Parser()

client.discordTogether = new DiscordTogether(client)

client.on('messageCreate', async message => {
    if (message.content === '!2gether') {
        if(message.member.voice.channel) {
            client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'youtube').then(async invite => {
                return message.channel.send(`${invite.code}`)
            })
        } else {
            return message.channel.send('Debes estar en un canal de voz para activar esta actividad')
        }
    }
})

client.on('ready', client =>{
    CodeRSS(client)
    //Function CodeRSS runs at minute 30, the reason why this function use cron and not setInterval is because setInterval only allows function, not a promise
    const cronCode = new CronJob('30 * * * *', () => {
        CodeRSS(client)
    }, null, true, 'America/Los_Angeles')
    cronCode.start()
})

const CodeRSS = async (client) =>  {
    const title = 'closers kr'
    const feed = await parser.parseURL(process.env.RSS)
    feed.items.forEach(item => {
        if(item.title.toLowerCase().includes(title)){
            Database.select(item.guid).then((response)=>{
                if(response.toLowerCase().includes('no update')){
                    //NOTHING TO PUT HERE
                } else if (response.toLowerCase().includes('new update')){
                    const data = [item.guid,item.title,item.link]
                    Database.insert(data)
                    client.channels.cache.get(process.env.CHID).send(`Nueva Actualizacion: ${item.title} \n Link: ${item.link}`)
                    console.log(`New update: ${item.title} \n Link: ${item.link}`)
                }
            })
        }
    })
}



client.login(process.env.TOKEN)