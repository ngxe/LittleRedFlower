var express = require('express');

var router = express.Router();

//引入连接数据库文件

var db = require("./db.js");

//创建首页

router.get('/', function (req, res, next) {

  //在首页显示表中所有数据

  db.query('select * from userinfo', function (err, rows) {

    if (err) {

      res.render('index', { title: 'Express', datas: [] });

    } else {

      //将数据显示在index.html页面

      res.render('index', { title: 'Express', datas: rows });

    }

  })

});

//创建增加页面

router.get('/add', function (req, res) {

  res.render('add');

});

//实现增加功能

router.post('/add', function (req, res) {

  //获取用户输入的信息

  var name = req.body.name;

  var age = req.body.age;

  //往数据库中插入信息

  db.query("insert into userinfo(name,age) values('" + name + "'," + age + ")", function (err, rows) {

    if (err) {

      res.end('新增失败：' + err);

    } else {

      //实现路径的跳转

      res.redirect('/');

    }

  })

});

//实现删除功能

router.get('/del/:id', function (req, res) {

  //获取参数中的id值

  var id = req.params.id;

  //删除当前id下的数据

  db.query("delete from userinfo where id=" + id, function (err, rows) {

    if (err) {

      res.end('删除失败：' + err)

    } else {

      res.redirect('/')

    }

  });

});

//创建修改页面

router.get('/toUpdate/:id', function (req, res) {

  var id = req.params.id;

  //查询当前id下的详细数据，并显示到修改页面

  db.query("select * from userinfo where id=" + id, function (err, rows) {

    if (err) {

      res.end('修改页面跳转失败：' + err);

    } else {

      //跳转到修改页面

      res.render("update", { datas: rows });

    }

  });

});

//实现修改功能

router.post('/update', function (req, res) {

  var id = req.body.id;

  var name = req.body.name;

  var age = req.body.age;

  //修改当前id下的数据

  db.query("update userinfo set name='" + name + "',age='" + age + "' where id=" + id, function (err, rows) {

    if (err) {

      res.end('修改失败：' + err);

    } else {

      res.redirect('/');

    }

  });

});

//实现查询功能

router.post('/search', function (req, res) {

  var name = req.body.s_name;

  var age = req.body.s_age;

  //创建查询的sql语句

  var sql = "select * from userinfo";

  if (name) {

    sql += " and name='" + name + "' ";

  }

  if (age) {

    sql += " and age=" + age + " ";

  }

  //替换掉匹配到的第一个and字符串，并该成where

  sql = sql.replace(/and/, "where");

  db.query(sql, function (err, rows) {

    if (err) {

      res.end("查询失败：", err)

    } else {

      //将查询的数据显示在index.html

      res.render("index", { title: 'Express', datas: rows, s_name: name, s_age: age });

    }

  });

});

module.exports = router;
