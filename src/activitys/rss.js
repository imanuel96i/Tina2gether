require('dotenv').config()
const Database = require('../bd/db')
const Parser = require('rss-parser')
const { Embed } = require('@discordjs/builders')
const parser = new Parser()
const CronJob = require('cron').CronJob

const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const AutoRSS = (client) => {
    codeCron(client)
    // nyaCron(client)
}

const codeCron = (client) => {
    CodeRSS(client)
    const cronCode = new CronJob('30 * * * *', () => {
        CodeRSS(client)
    }, null, true, 'America/Santiago')
    cronCode.start()
}

const nyaCron = (client) => {
    NyaRSS(client)
    const cronNya = new CronJob('*/5 * * * *', () => {
        NyaRSS(client)
    }, null, true, 'America/Santiago')
    cronNya.start()
}

const CodeRSS = async (client) =>  {
    const title = 'kr updates'
    const feed = await parser.parseURL(process.env.CODERSS)
    feed.items.forEach(item => {
        if(item.title.toLowerCase().includes(title)){
            Database.select(item.guid,process.env.KRUP).then((response)=>{
                if(response.toLowerCase().includes('no update')){
                    //NOTHING TO PUT HERE
                } else if (response.toLowerCase().includes('new update')){
                    const data = [item.guid,item.title,item.link]
                    Database.insert(data,process.env.KRUP)
                    client.channels.cache.get(process.env.CHID).send({
                        embeds: [{
                            title: `${item.title}`,
                            color: 'BLUE',
                            url: item.link,
                            fields: [
                                {
                                    name: item.title,
                                    value: item.contentSnippet.replace(/\s+/g, ' ').trim().substring(0, 500).concat('...')
                                },
                            ]
                        }]
                    })
                    console.log(`New update: ${item.title} \n Link: ${item.link}`)
                }
            })
        }
    })
    console.log('----------------------------------------------------')
}

const NyaRSS = async (client) => {
    const feed = await parser.parseURL(process.env.NYARSS)
    data = []
    feed.items.forEach(item => {
        id = item.guid.split('//')[1].split('/')[2]
        data.push([id, item.title,item.guid, item.link, item.content, item.pubDate])
    })
    data.sort((a, b) => {
        if (a > b) return 1
        if (a < b) return -1
        return 0
    })
    data.forEach(item => {
        Database.select(item[0], process.env.NYAUP)
            .then((response) => {
                if (response.toLowerCase().includes('no update')) {
                    //NOTHING TO PUT HERE
                } else if (response.toLowerCase().includes('new update')) {
                    const dat = [item[0], item[1], item[2]]
                    Database.insert(dat,process.env.NYAUP)
                    client.channels.cache.get(process.env.CHID).send({
                        embeds: [{
                            title: `${item[1]}`,
                            color: 'BLUE',
                            url: item[2],
                            fields: [
                                {
                                    name: 'Torrent',
                                    value: item[3]
                                },
                                {
                                    name: 'Contenido',
                                    value: item[4]
                                },
                                {
                                    name: 'Fecha',
                                    value: item[5]
                                }
                            ]
                        }]
                    })
                    console.log(`New update: ${item[1]}} \n Link: ${item[2]}`)
                    sleep(3000)
                }
            })
            .catch((err) => {
                console.error(err)
            })
    })
    console.log('2------------------------------------')
}

module.exports = {AutoRSS}