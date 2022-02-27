const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('mydb.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the mydb database.')
});

db.run('create table if not exists krupdates (id integer, title text, link text)')

const insert = (data) =>{
    return new Promise((res, jet) =>{
        const sql = `INSERT INTO krupdates VALUES(?, ?, ?)`
        db.run(sql, data, function(err) {
            if (err) {
                jet(err.message)
            }
            res(`Rows inserted ${this.changes}`)
        })
    })
}

const select = (id) =>{
    return new Promise((res, jet) =>{
        db.serialize(() => {
            db.all(`SELECT * from krupdates where id=${id}`, (err, row) => {
                if (err) {
                    jet(err.message);
                }else {
                    if(row[0]===null || row[0]==='' || row[0]===undefined){
                        db.all('SELECT * from krupdates order by id desc', (err, row2) =>{
                            if (err) {
                                jet(err.message)
                            } else {
                                if(row2[0]===null || row2[0]==='' || row2[0]===undefined){
                                    res('New Update')
                                } else {
                                    if(row2[0].id>=id){
                                        res(`No Update ${row2[0].id}>=${id}`)
                                    } else if(row2[0].id<id){
                                        res('New Update')
                                    }
                                }
                            }
                        })
                    } else {
                        // console.log(`No Update se encontro la id: ${id}`)
                        res('No Update')
                    }
                }
            })
        })
    })
    
}

const close = () =>{
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    })
}

module.exports = {insert, select}