/**
 * Created by !!.Swapnil..Aryan.!! on 13-Apr-16.
 */
var express = require("express");
var mysql   = require("mysql");
var bodyParser  = require("body-parser");
var md5 = require('MD5');
var rest = require("./REST.js");
var app  = express();

function REST(){
    var self = this;
    self.connectMysql();
}
REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 100,
        host     : '127.0.0.1',
        user     : 'root',
        password : '',
        port     : 3307,
        database : 'movie_theatre',
        debug    :  false
    });
    pool.getConnection(function(err,connection){
        if(err) {
            self.stop(err);
        } else {
            self.configureExpress(connection);
        }
    });
};

REST.prototype.configureExpress = function(connection) {
    var self = this;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    //handle cors issue
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    });
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //end handling
    var router = express.Router();
    app.use('/api', router);
    var rest_router = new rest(router,connection,md5);
    self.startServer();
};

REST.prototype.startServer = function() {
    app.listen(3000,function(){
        console.log("All right ! I am alive at Port 3000.");
    });
};

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
};

new REST();