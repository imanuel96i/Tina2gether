require('dotenv').config()
const Database = require('../bd/db')
const Parser = require('rss-parser')
const parser = new Parser()
const CronJob = require('cron').CronJob

const AutoRSS = (client) => {
    CodeRSS(client)
    //Function CodeRSS runs at minute 30, the reason why this function use cron and not setInterval is because setInterval only allows function, not a promise
    const cronCode = new CronJob('30 * * * *', () => {
        CodeRSS(client)
    }, null, true, 'America/Santiago')
    cronCode.start()
}

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
    console.log('----------------------------------------------------')
}

module.exports = {AutoRSS}