pg = require('pg')

function log(msg){
    console.log("db: " + msg);
}
 
exports.init = function(conf){
    var conString = "postgres://postgres:Passwort07@localhost:5432/wuzzler_db";
    var client = new pg.Client(conString);

    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);
        } else {
            console.log ('connected to postgres.');
        }
    });

    return {
        client: client,

        login: function(username, passwd, callback){
            log("login: " + username +"/" + passwd);
            client.query('SELECT * from login($1,$2)',[username, passwd], function(err, res) {
                if(err) {
                    console.error('db: error running query', err);
                    callback({message:'internal error', data:null});
                }else if(res.rows.length != 1){
                    console.error('db: invalid login');
                    callback({message: 'invalid credentials', data: null});
                }else{
                    log('db: login: '+JSON.stringify(res.rows[0]));
                    callback({message: 'login ok', data: res.rows[0]})
                }
            });
        },
        register: function(username, passwd, callback){
            log("register: " + username +"/" + passwd);
            client.query('SELECT * from register($1,$2)',[username, passwd], function(err, res) {
                if(err) {
                    console.error('db: error running query', err);
                    callback({message: 'username taken', data: null });
                    return
                }
                log('db: registration successfull', res.rows[0]);
                callback({message: "OK", data: res.rows[0]});
            });
        },
        getUser: function(cookie, callback){
            log("getUser *** : " + cookie);
            client.query('SELECT * from get_user($1)',[cookie], function(err, res) {
                if(err) {
                    console.error('error running query', err);
                    callback('internal error');
                }else if(res.rows.length != 1){
                    console.error('invalid cookie', res);
                    callback('invalid cookie');
                }else{
                    log('getUser**: '+JSON.stringify(res.rows[0]));
                    callback(null, res.rows[0])
                }
            });
        },
        addGame: function(red, blue, goals_red, goals_blue){
            log("addGame: ");
            client.query('SELECT * from add_game($1, $2, $3, $4)',[red, blue, goals_red, goals_blue], function(err, res) {
                if(err) {
                    console.error('error running query', err);
                }else{
                    log('addGame: '+JSON.stringify(res.rows[0]));
                }
            });
        },
        getTop10: function(period, callback){
            log('period:' +period);
            if (period === 'all'){
                log('select form view');
                client.query('SELECT * from v_top LIMIT 10',[], function(err, res) {
                    if(err) {
                        console.error('error running query', err);
                        callback({message:'internal error', data: null});
                    }else{
                        callback({message: 'OK', data: res.rows})
                    }
                });
            }else{
                log('select form fnc');
                client.query('SELECT * from f_top($1) LIMIT 10',[period], function(err, res) {
                    if(err) {
                        callback({message:'internal error', data: null});
                    }else{
                        callback({message: 'OK', data: res.rows})
                    }
                });
            }
        },
        getUserStats: function(user, period, callback){
            log('period:' +period);
            if (period === 'all'){
                log('select form view');
                client.query('SELECT * from v_top where name=$1',[user], function(err, res) {
                    if(err) {
                        console.error('error running query', err);
                        callback('internal error');
                    }else{
                        callback(null, res.rows[0])
                    }
                });
            }else{
                log('select form fnc');
                client.query('SELECT * from f_top($1) where name=$2',[period, user], function(err, res) {
                    if(err) {
                        console.error('error running query', err);
                        callback('internal error');
                    }else{
                        callback(null, res.rows[0])
                    }
                });
            }
        }

    }
};
