var express = require('express');
var fs = require("fs");
const multer = require('multer');
// 临时存储上传图片
const upload = multer({ dest: 'uploads/' });
var router = express.Router();

var db = require("./db.js");

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


//创建增加页面

router.get('/index', function (req, res) {

  res.render('indexMain');

});

router.post('/getRewards', upload.single('file'), async function (req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const file = req.file;

  console.log(file, "file");
  if (!file) {
    return res.end('未上传图片');
  }
  const now = new Date();

  const year = now.getFullYear();
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const day = ('0' + now.getDate()).slice(-2);
  const hours = ('0' + now.getHours()).slice(-2);
  console.log(hours, "hours");
  const arr = ["07", "08", "09", "11", "12", "13", "17", "18", "19"]
  if (!arr.includes(hours)) {
    return res.end('不在打卡时间！')
  } else {
    console.log("ok");
  }

  const formattedTime = year + month + day;

  let tms;
  try {
    // 查询 time 为 '2012' 的数据
    tms = await queryAsync('SELECT * FROM submitlist WHERE time = ?', [formattedTime]);
    console.log(tms, "tms");
  } catch (err) {
    console.log(err, "err");
  }

  console.log(tms.length, "tms.Length");
  if (tms.length >= 3) {
    return res.end('今天已打卡三次，不能再打卡了！');
  }

  const arr2 = ["07", "08", "09"].includes(hours)
  const arr3 = ["11", "12", "13"].includes(hours)
  const arr4 = ["17", "18", "19"].includes(hours)

  if (arr2 == true) {
    for (const tm of tms) {
      if (["07", "08", "09"].includes(tm.hour)) {
        return res.end('该时间段已经打过卡了！');
      }
    }
  } else if (arr3 == true) {
    for (const tm of tms) {
      if (["11", "12", "13"].includes(tm.hour)) {
        return res.end('该时间段已经打过卡了！');
      }
    }
  } else if (arr4 == true) {
    for (const tm of tms) {
      console.log(tm, "tm");
      if (["17", "18", "19"].includes(tm.hour)) {
        return res.end('该时间段已经打过卡了！');
      }
    }
  }


  const amount = req.body.amount;



  const imgData = fs.readFileSync(file.path); // 读取为 Buffer
  let rows
  try {
    rows = await queryAsync('SELECT * FROM rewardluantity', []);
    console.log(rows, "rows");
  } catch (err) {
    console.log(err, "err");
  }
  // 获取一个连接
  db.pool.getConnection(function (err, connection) {
    if (err) {
      return res.end('获取数据库连接失败：' + err);
    }

    // 开始事务
    connection.beginTransaction(function (err) {
      if (err) {
        connection.release(); // 开始事务失败时释放连接
        return res.end('事务启动失败：' + err);
      }

      // 执行 INSERT 操作
      connection.query(
        "INSERT INTO submitlist(time, hour,img) VALUES (?,?, ?)", [formattedTime, hours, imgData], function (err, result) {
          if (err) {
            // 插入失败，回滚事务
            return connection.rollback(function () {
              connection.release();
              res.end('插入失败，事务回滚：' + err);
            });
          }
          // 执行 UPDATE 操作
          connection.query(
            "UPDATE rewardluantity SET flowers = ? WHERE id = 1", [(Number(rows[0].flowers) + Number(amount)).toString()], function (err, result) {
              if (err) {
                // 更新失败，回滚事务
                return connection.rollback(function () {
                  connection.release();
                  res.end('更新失败，事务回滚：' + err);
                });
              }
              // 提交事务
              connection.commit(function (err) {
                if (err) {
                  // 提交失败，回滚事务
                  return connection.rollback(function () {
                    connection.release();
                    res.end('提交失败，事务回滚：' + err);
                  });
                }
                // 提交成功，重定向
                connection.release(); // 释放连接
                res.redirect('/users/statistics');
              });
            }
          );
        }
      );
    });
  });

});

router.get('/detail', function (req, res) {

  res.render('detailMain');

});

router.get('/test', function (req, res) {

  res.render('testMain');

});

router.get('/text', function (req, res) {

  res.render('textMain');

});

router.get('/exchange', function (req, res) {

  res.render('exchangeMain');

});

router.post('/exchange', async function (req, res) {

  var type = req.body.type;

  var amount = req.body.amount;

  let rows
  try {
    rows = await queryAsync('SELECT * FROM rewardluantity', []);
    console.log(rows, "rows");
  } catch (err) {
    console.log(err, "err");
  }

  // db.query("insert into requestlist(type,amount) values('" + type + "'," + amount + ")", function (err, rows) {

  //   if (err) {

  //     res.end('新增失败：' + err);

  //   } else {

  //     res.redirect('/users/exchange');
  //   }

  // })

  // 获取一个连接
  db.pool.getConnection(function (err, connection) {
    if (err) {
      return res.end('获取数据库连接失败：' + err);
    }

    // 开始事务
    connection.beginTransaction(function (err) {
      if (err) {
        connection.release(); // 开始事务失败时释放连接
        return res.end('事务启动失败：' + err);
      }

      // 执行 INSERT 操作
      connection.query(

        "UPDATE rewardluantity SET flowers = ? WHERE id = 1", [(Number(rows[0].flowers) - Number(10) * Number(amount)).toString()], function (err, result) {
          if (err) {
            // 插入失败，回滚事务
            return connection.rollback(function () {
              connection.release();
              res.end('插入失败，事务回滚：' + err);
            });
          }
          // 执行 UPDATE 操作
          connection.query(

            "INSERT INTO requestlist(type, amount) VALUES (?,?)", [type, amount], function (err, result) {

              if (err) {
                // 更新失败，回滚事务
                return connection.rollback(function () {
                  connection.release();
                  res.end('更新失败，事务回滚：' + err);
                });
              }
              // 提交事务
              connection.commit(function (err) {
                if (err) {
                  // 提交失败，回滚事务
                  return connection.rollback(function () {
                    connection.release();
                    res.end('提交失败，事务回滚：' + err);
                  });
                }
                // 提交成功，重定向
                connection.release(); // 释放连接
                res.redirect('/users/statistics');
              });
            }
          );
        }
      );
    });
  });

});


router.get('/statistics', function (req, res) {


  db.query('select * from rewardluantity', function (err, rows) {

    if (err) {

      res.render('index', { title: 'Express', datas: [] });

    } else {

      //将数据显示在index.html页面

      res.render('statisticsMain', { title: 'Express', datas: rows });
    }

  })

});


module.exports = router;
