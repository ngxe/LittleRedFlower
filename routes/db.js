//创建数据库连接池，连接mysql
// var mysql = require('mysql');
var mysql = require('mysql2');

var pool = mysql.createPool({

    host: 'mysql.sqlpub.com',

    user: 'hd_user',

    password: 'CLkzhDo2x4RIIGx5',

    database: 'hd_sql'

});

// function query(sql, callback) {

//     //得到连接

//     pool.getConnection(function (err, connection) {

//         //使用连接
//         connection.query(sql, function (err, rows) {

//             callback(err, rows);

//             //释放连接
//             connection.release();

//         });

//     });

// }


function query(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.getConnection(function (err, connection) {
        if (err) return callback(err);

        connection.query(sql, params, function (err, rows) {
            callback(err, rows);
            connection.release();
        });
    });
}

exports.query = query;
exports.pool = pool;

