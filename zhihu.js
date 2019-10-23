//1.导入express的模板
const express = require('express');
//2.使用express模块创建服务器
const app = express();

//导入mysql的模块
const mysql = require('mysql');

/* 指定模板引擎
第一个参数固定写法
第二个参数是模板引擎的名字*/
app.set('view engine' , 'ejs');

/* 设置模板引擎对应网页文件的存放路径
 第一个参数固定写法
 第二个参数可以自定义，表示的是网页文件的存放文件夹的名字*/
app.set('views' , 'ejsviews')
const bodyParser = require('body-parser');
//解析post发送过来的数据
app.use(bodyParser.urlencoded({extended:false}));

//session对象
const session = require('express-session');
app.use(
	session({
		secret:'这是加密的秘钥',
		resave:false,
		saveUninitialized:false
	})
)

//设置css,js文件的访问路径
app.use('/public',express.static('public'));//第一个参数表示请求的地址中包含了/public，第二个参数表示所访问的文件夹

//指定连接mysql的用户名和密码，这个过程叫创建连接对象
const conn = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'cls'
})



//接受浏览器发送过来的请求,并且执行对应hanshu 
app.get('/' , function(req,res){
	res.render('register.ejs');
});
app.get('/login',function(req,res){
	res.render('login.ejs');
})
app.get('/add',function(req,res){
	if(typeof req.session.userName==='undefined'){
		//如果没有值，跳转到登录页面，让用户登录
		res.redirect('/login');
	}else{
		res.render('addArticel.ejs',{userInforName:req.session.userName});
	}
	
})
app.get('/showArticel',function(req,res){
	var aid = req.query.id;
	const sql="select * from articel where id=?"
	conn.query(sql,aid,function(err,result){
		if(err){
			
		}else{
			res.render('show.ejs',{title:result[0].title,content:result[0].content,author:result[0].author});
		}
	})
})

//退出登录
app.post('/userLoginOut',function(req,res){
	//退出登录就是清除sessio中的数据
	req.session.destroy(function(){
		res.send({flag:'yes'});
	})
})

//判断邮箱
app.post('/checkEmail',function(req,res){
	var email = req.body.userEmail;
	const sql = "select count(*) as counta from user where email =?"//cont(*)统计数据的个数，统计的是满足条件的数据的个数
	conn.query(sql,email,function(err,result){
		if(err){
			res.send({msg:'查询失败'});
		}else{
			//判断查询出来的记录的个数，如果大于0，表示数据库中有此邮箱，这时返回的信息为‘邮箱已经被注册’
			if(result[0].counta>0){
				res.send({msg:'邮箱被占用了'});
			}else{
				res.send({msg:'此邮箱可用'});
			}
		}
	})
})

//注册
app.post('/regist',function(req,res){
	var userEmail = req.body.email;
	var userName = req.body.name;
	var userPwd = req.body.pwd;
	//插入数据之前有必要再次判断邮箱是否存在
	const sqlStr = "select count(*) as counta from user where email =?"//cont(*)统计数据的个数，统计的是满足条件的数据的个数
	conn.query(sqlStr,userEmail,function(err,result){
		if(err){
			res.send({msg:'查询失败'});
		}else{
			//判断查询出来的记录的个数，如果大于0，表示数据库中有此邮箱，这时返回的信息为‘邮箱已经被注册’
			if(result[0].counta>0){
				res.send({msg:'邮箱被占用了'});
			}else{
				res.send({msg:'此邮箱可用'});
			}
		}
	})
		const sql = "insert into user(name,password,email) values(?,?,?)"
		conn.query(sql,[userName,userPwd,userEmail],function(e,result){
			if(e){
				res.send({msg:'注册失败',flag:'no'});
			}else{
				res.send({msg:'注册成功',flag:'yes'});
			}
		})
	
})
//登录
app.post('/userLogin',function(req,res){
	var loginEmail = req.body.email;
	var loginPwd = req.body.password;
	const sql = "select * from user where email=? and password=? "
	conn.query(sql,[loginEmail,loginPwd],function(e,result){
		if(e){
			res.send({msg:'查询失败',flag:'no'});
		}else{
			if(result.length!==1){
				res.send({msg:'用户名或密码错误',flag:'no'});
			}
			req.session.userName = result[0].name;
			res.send({msg:'登录成功',flag:'yes'});
		}
	})
})

//完成文章的添加保存
app.post('/addArticel',function(req,res){
	var title = req.body.atitle;
	var content = req.body.acontent;
	const sql = "insert into articel(title,content,author) values(?,?,?)";
	conn.query(sql,[title,content,req.session.userName],function(err,result){
		if(err) return res.send({msg:'文章添加失败',flag:'no'});//result这个对象中有一个insert属性，奥村了刚刚插入的id
		res.send({msg:'文章添加成功',flag:'yes',aid:result.insertId});
			
		
	})
})

/* app.post('/userList' , function(req,res){
	const sql = "select * from user";
	conn.query(sql,function(err,result){
		if(err){
			res.send({ msg:err.message ,flag:'no'});
		}else{
			res.send({ msg:result , flag:'yes' });
		}
		
	})
	})

//删除数据	
app.post('/delUser',function(req,res){
	//如果是post请求，传递数据，必须安装一个包bady-parser
	const userId=req.body.Id//接收传递过来的userId的数据，注意id写法和ejs文件中‘id’写法一致
	const sql='delete from user where Id=?'//?表示占位符，要用具体的 数值代替
	conn.query(sql,userId,function(err,result){
		if(err){
			res.send({ msg:'删除失败' ,flag:'no'});
		}else{
			res.send({ msg:'删除成功' , flag:'yes' });
		}
		
	})
}) */

app.listen(3306,function(){
	console.log('is running');
}) 