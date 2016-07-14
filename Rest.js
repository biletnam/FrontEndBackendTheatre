/**
 * Created by !!.Swapnil..Aryan.!! on 13-Apr-16.
 */
var mysql = require("mysql");
var reqPro = require('request-promise');
var RottenCrawler = require("./RottenCrawler.js");
var async = require("async");
var apiKey = "2c9306d42037dfb0de0fc3f153819054";
var fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio');

var shortid = require('shortid');
var bcrypt = require('bcryptjs');
var conn="";
var pool="";
var sess;
function REST_ROUTER(router,connection,pool) {



    var self = this;
    conn = connection;
    console.log("this pool", this.pool);
    //this.pool = pool;
    console.log("this pool", this.pool);
    var rc = new RottenCrawler("For Connection");
    var con = rc.getConnection(conn,pool);
    self.handleRoutes(router,connection,pool);
}

//Run the upcoming api everyday
var cron = require('cron');
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
console.log("Hi");
//var cronJob = cron.job("00 06 01 * * *", function(){
var cronJob1 = cron.job("* 28 * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    reqPro('http://localhost:8000/api/upcoming').then(function(response){
        console.info('cron job completed',response);
    });
    //request('http://localhost:8000/api/upcoming',function(response){
    //    console.log("Started",response);
    //});
    console.info('cron job completed --------------');
});
//cronJob1.start();
var cronJob2 = cron.job("* * * * * *", function(){
    var today = new Date();
    var time = today.toISOString().substring(0, 10);
    /*Delete Released Movies*/
    var query = "DELETE FROM upcomingmovies WHERE upReleaseDate <= ?";
    var table = [time];
    query = mysql.format(query, table);
    conn.query(query, function (err, rows) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success");
        }
    });
    //conn.release();
    /*End Deleting*/
});
//cronJob2.start();

REST_ROUTER.prototype.handleRoutes= function(router,connection,pool) {
    router.get("/upcoming",function(req,res) {
        var items = [1];
        var totPage = [];
        var ret = [];
        async.eachSeries(items, function(item, callback){
            var url = "http://api.themoviedb.org/3/movie/upcoming?api_key="+apiKey+"&page=" + item + "&language=en";
            reqPro(url).then(function(response){
                for(var i =1;i<=JSON.parse(response).total_pages;i++){
                    totPage.push(i);
                }
                callback();
            });
        },function (err){
            if(err){
                console.log("Some Error happened at url fetching. Do manually",err);
            }
            else{
                console.log("All Upcoming Movies Fetched");
                async.eachSeries(totPage, function(item, callback) {

                    // Perform operation on file here.
                    var url = "http://api.themoviedb.org/3/movie/upcoming?api_key="+apiKey+"&page=" + item + "&language=en";
                    reqPro(url).then(function(response){
                        var t = [];
                        for(var x = 0;x<JSON.parse(response).results.length;x++){
                            t.push(x);
                        }
                        async.eachSeries(t, function(i, callback) {
                            var upC = {
                                "id": "",
                                "title": "",
                                "release_date":"",
                                "poster_path":"",
                                "original_language":"",
                                "page":""
                            };
                            if(JSON.parse(response).results[i].original_language=='en'){
                                async.series([
                                    function(callback){
                                    // do some stuff ...
                                        var date = new Date();
                                        var year = date.getFullYear();
                                        //var fetchRuntimeURL = "http://www.omdbapi.com/?t="+JSON.parse(response).results[i].title+"&y="+year+"&plot=short&r=
                                        var fetchRuntimeURL = "http://api.themoviedb.org/3/movie/"+JSON.parse(response).results[i].id+"?api_key="+apiKey;
                                        reqPro(fetchRuntimeURL).then(function(responsee){
                                            console.log(JSON.parse(response).results[i].title,"!@#$%^&*()_+",JSON.parse(responsee).runtime);
                                        });
                                        callback(null, 'one');
                                    },
                                    function(callback){
                                        // do some more stuff ...
                                        callback(null, 'two');
                                    }
                                ],
                                function(err, results){
                                    // results is now equal to ['one', 'two']
                                });
                                upC["id"] = JSON.parse(response).results[i].id;
                                upC["page"] = JSON.parse(response).page;
                                upC["title"] = JSON.parse(response).results[i].title;
                                upC["release_date"] = JSON.parse(response).results[i].release_date;
                                upC["poster_path"] = '/images/upcoming'+JSON.parse(response).results[i].poster_path;
                                upC["original_language"] = JSON.parse(response).results[i].original_language;

                                /*Adding to Database*/
                                var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
                                var table = ["upcomingmovies","upMovieId","upMovieName","upReleaseDate","upPosterPath",
                                    JSON.parse(response).results[i].id,
                                    JSON.parse(response).results[i].title,
                                    JSON.parse(response).results[i].release_date,
                                    "/images/upcoming"+JSON.parse(response).results[i].poster_path
                                ];
                                query = mysql.format(query,table);
                                pool.getConnection(function(err,connection){
                                    if(err){
                                        console.log("Error happened :- ",err);
                                        res.json(err);
                                        //self.connectMysql();
                                    }else {
                                        connection.query(query, function (err, rows) {
                                            //if(pool._freeConnections.indexOf(conn) == -1){
                                            //    conn.release();
                                            //}
                                            if (err) {
                                                console.log("Here line 114 Error", err);
                                            } else {
                                                console.log("Success");
                                            }
                                        });
                                    }
                                    connection.release();
                                });
                                /*End adding*/

                                if(JSON.parse(response).results[i].poster_path != null){
                                    var ll =[i];
                                    async.eachSeries(ll, function(i, callback) {
                                        download('http://image.tmdb.org/t/p/w500'+JSON.parse(response).results[i].poster_path
                                            , './app/images/upcoming'+JSON.parse(response).results[i].poster_path, function(){
                                                console.log('image downloaded');
                                            });
                                        callback();
                                    }, function(err){
                                        // if any of the file processing produced an error, err would equal that error
                                        if( err ) {
                                            // One of the iterations produced an error.
                                            // All processing will now stop.
                                            console.log('A file failed to process',err);
                                        } else {
                                            console.log('All files have been processed successfully');
                                        }
                                    });
                                }
                                ret.push(upC);
                                //console.log("ret is ",ret);
                            }
                            callback();
                        },function(err){
                            // if any of the file processing produced an error, err would equal that error
                            if( err ) {
                                // One of the iterations produced an error.
                                // All processing will now stop.
                                console.log('A file failed to process',err);
                            } else {
                                console.log('All files have been processed successfully');
                            }
                        });
                        callback();
                    });
                }, function(err){
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('A file failed to process',err);
                    } else {
                        console.log('All files have been processed successfully');
                        res.json(ret);
                    }
                });
            }
        });
    });

    router.get("/rt/:movie_name", function (req,res) {
        var rc = new RottenCrawler();
        rc.getMovieInfo()
            .then(function() {
                res.json(rc);
            });
    });
    router.get("/rt/:movie_name/critics", function (req,res) {
        //console.log(req.params.movie_name);
        var rc = new RottenCrawler('/m/'+req.params.movie_name+'/');
        rc.getCriticsInfo()
            .then(function() {
                res.json(rc);
            });
    });
    router.get("/rotten_tomatoes/:movie_name", function (req,res) {
        var rc = new RottenCrawler(req.params.movie_name);
        var tomatoURL = "";
        var imdb_id = "";
        var crawlTomatoData = "";
        async.series([
            function(callback){
                rc.theMovieDB()
                    .then(function() {
                        //console.log(rc.movieResponse["movieInfo"]);
                        imdb_id = rc.movieResponse["movieInfo"][0].imdb_id;
                        tomatoURL = rc.movieResponse["omdbData"][0].tomatoURL;
                        tomatoURL = tomatoURL.replace("http://www.rottentomatoes.com","");
                        console.log("Done",tomatoURL);
                        callback();
                    });
            },
            function(callback){
                var rc = new RottenCrawler(tomatoURL);
                rc.getMovieInfo()
                    .then(function() {
                        crawlTomatoData = rc.crawlTomato;
                        callback();
                    });
            }
        ],function(err){
            if(err){
                res.json({"Error" : true, "Message" : "Error Details:- "+err});
            }
            else{
                res.json({"Error" : false, "Message" : "Success"});
            }
        });
    });
    router.get("/the_movie_db/:movie_name", function (req,res){
        /*Using Async WaterFall Model to collect Data for the year 2016*/
        var date = new Date();
        var year = date.getFullYear();
        var searchElementID = '';
        var url = 'http://api.themoviedb.org/3/search/movie?api_key='+apiKey+"&query="+req.params.movie_name+"&year="+year;
        var re = {};
        async.waterfall([
            //1stly Search Movies via apiary/search/movie
            function(callback) {
                reqPro(url).then(function(response){
                    var ret = JSON.parse(response).results;
                    //console.log(re.response[0].poster_path);
                    // if movie not found
                    //console.log("total results",response,);
                    if( JSON.parse(response).total_results!=0){
                        if(ret[0].poster_path!=null){
                            download('http://image.tmdb.org/t/p/w500'+ret[0].poster_path
                                , './app/images/nowShowing'+ret[0].poster_path, function(){
                                    console.log('saved image');
                                });
                        }
                        callback(null, ret[0].id);
                    }else{
                        res.json({"Error":true, "Message":"No Movies Found"});
                    }
                });
            },
            function(id, callback) {
                // id now equals 2nd parameter from previous callback
                //2ndly get movie details as per id(set by apiary)
                var url2 = 'http://api.themoviedb.org/3/movie/'+id+'?api_key='+apiKey;
                reqPro(url2).then(function(response){
                    re.movieDetails = JSON.parse(response);
                    //console.log(JSON.parse(response));
                    callback(null, re.movieDetails.imdb_id,id);
                });
            },
            function(imdb_id, id,callback) {
                //3rdly call OMDB API for extra results
                searchElementID = id;
                var url3 = "http://www.omdbapi.com/?i="+imdb_id+"&plot=full&r=json&tomatoes=true";
                reqPro(url3).then(function(response){
                    re.omdbData = JSON.parse(response);
                    callback(null,id);
                });
            },
            //lastly call the casts and crews
            function(id,callback){
                var url4 = 'http://api.themoviedb.org/3/movie/'+id+'/credits?api_key='+apiKey;
                reqPro(url4).then(function(response){
                    re.credits = JSON.parse(response);
                    //console.log(";;;;;",re.credits.cast.length);
                    var times2iterate = [];
                    for(var i=0;i<re.credits.cast.length;i++){
                        times2iterate.push(i);
                    }
                    //save cast images to credits
                    async.eachSeries(times2iterate, function(i, callback) {
                            if(re.credits.cast[i].profile_path != null){
                                download('http://image.tmdb.org/t/p/w500'+re.credits.cast[i].profile_path
                                    , './app/images/credits'+re.credits.cast[i].profile_path, function(){
                                        console.log('saved image');
                                    });
                            }
                            callback();
                        },
                        function(err){
                            // if any of the file processing produced an error, err would equal that error
                            if( err ) {
                                // One of the iterations produced an error.
                                // All processing will now stop.
                                res.json({"Error":true, "Message":err});
                                console.log('A file failed to process',err);
                            } else {
                                console.log('All files have been processed successfully');
                                //res.json(ret);
                            }
                        });
                    callback(null,re);
                });
            },
            //Now we are ready to save them to database
            function(toBeSaved,callback){
                //for(var k = 0;k<toBeSaved.credits.cast.length;k++){
                //    console.log("---",toBeSaved.omdbData);
                //}
                /*Beautifying our data*/

                toBeSaved.movieDetails.id = (toBeSaved.movieDetails.id)?toBeSaved.movieDetails.id:"N/A";
                toBeSaved.movieDetails.imdb_id = (toBeSaved.movieDetails.imdb_id)?toBeSaved.movieDetails.imdb_id:"N/A";
                toBeSaved.omdbData.Title = (toBeSaved.omdbData.Title)?toBeSaved.omdbData.Title:"N/A";
                toBeSaved.omdbData.Released = (toBeSaved.omdbData.Released)?toBeSaved.omdbData.Released:"N/A";
                toBeSaved.omdbData.Runtime = (toBeSaved.omdbData.Runtime)?toBeSaved.omdbData.Runtime:"N/A";
                toBeSaved.omdbData.Rated = (toBeSaved.omdbData.Rated)?toBeSaved.omdbData.Rated:"N/A";
                toBeSaved.omdbData.Writer = (toBeSaved.omdbData.Writer)?toBeSaved.omdbData.Writer:"N/A";
                toBeSaved.omdbData.Genre = (toBeSaved.omdbData.Genre)?toBeSaved.omdbData.Genre:"N/A";
                toBeSaved.omdbData.imdbRating = (toBeSaved.omdbData.imdbRating)?toBeSaved.omdbData.imdbRating:"N/A";
                toBeSaved.omdbData.Production = (toBeSaved.omdbData.Production)?toBeSaved.omdbData.Production:"N/A";
                toBeSaved.omdbData.Production = (toBeSaved.omdbData.Production)?toBeSaved.omdbData.Production:"N/A";
                toBeSaved.omdbData.Website = (toBeSaved.omdbData.Website)?toBeSaved.omdbData.Website:"N/A";
                //toBeSaved.omdbData.Plot = (toBeSaved.omdbData.Plot)?toBeSaved.omdbData.Plot:"N/A";
                // This is just alternative of OMDB... fetching from themovieapiary
                toBeSaved.omdbData.Plot = (toBeSaved.movieDetails.overview)?toBeSaved.movieDetails.overview:"N/A";
                toBeSaved.movieDetails.poster_path = (toBeSaved.movieDetails.poster_path)?toBeSaved.movieDetails.poster_path:"N/A";
                toBeSaved.omdbData.BoxOffice = (toBeSaved.omdbData.BoxOffice)?toBeSaved.omdbData.BoxOffice:"N/A";

                /*End Beautifying data*/
                /*Adding to Database*/
                var query = "INSERT INTO movieinfo " +
                    "(infoMovieID, " +
                    "infoImdbID, " +
                    "infoMovieName," +
                    "infoMovieInTheatres, " +
                    "infoMovieRuntime, " +
                    "infoMovieRated, " +
                    "infoMovieDirectedBy, " +
                    "infoMovieWrittenBy, "+
                    "infoMovieGenre, " +
                    "infoMovieImdbRating, " +
                    "infoMovieProduction, " +
                    "infoMovieWebsite, " +
                    "infoMovieDescription, " +
                    "infoMoviePosterPath, " +
                    "infoMovieCasts, "+
                    "infoMovieBoxOffice) VALUES " +
                    "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                var table = [
                    toBeSaved.movieDetails.id,
                    toBeSaved.movieDetails.imdb_id,
                    toBeSaved.omdbData.Title,
                    toBeSaved.omdbData.Released,
                    toBeSaved.omdbData.Runtime,
                    toBeSaved.omdbData.Rated,
                    toBeSaved.omdbData.Director,
                    toBeSaved.omdbData.Writer,
                    toBeSaved.omdbData.Genre,
                    toBeSaved.omdbData.imdbRating,
                    toBeSaved.omdbData.Production,
                    toBeSaved.omdbData.Website,
                    toBeSaved.omdbData.Plot,
                    "/images/nowShowing"+toBeSaved.movieDetails.poster_path,
                    JSON.stringify(toBeSaved.credits.cast),
                    toBeSaved.omdbData.BoxOffice
                ];
                pool.getConnection(function(err,connection){
                    if(err){
                        console.log("Error happened :- ",err);
                        res.json(err);
                        //self.connectMysql();
                    }else {
                        query = mysql.format(query, table);
                        //console.log(query);
                        connection.query(query, function (err, rows) {
                            if (err) {
                                console.log("Here line 370 Error", err);
                            } else {
                                console.log("Success");
                            }
                        });
                    }
                    connection.release();
                });
                /*End adding*/
                callback(null,toBeSaved);
            }
        ], function (err, result) {
            // result now equals 'done'
            if(err){
                res.json({"Error":true, "Message":err});
            }else{
                console.log("seacrghc ekelment is ",searchElementID);
                var query = 'SELECT * FROM ?? WHERE infoMovieID = ?';
                var table = ["movieinfo",searchElementID];
                pool.getConnection(function(err,connection) {
                    if (err) {
                        console.log("Error happened :- ", err);
                        res.json(err);
                        //self.connectMysql();
                    } else {
                        query = mysql.format(query, table);
                        //console.log(query);
                        connection.query(query, function (err, rows) {
                            if (err) {
                                console.log("Here line 393 Error", err);
                            } else {
                                console.log("Success");
                                res.json(rows);
                            }
                        });
                    }
                    connection.release();
                });
            }
        });
        /*End Waterfall*/
    } );
    /*Fetch from our database*/
    // 1. Get all from movietomatoes
    router.get("/db/rottenTomatoes/:imdbID", function (req,res) {
        var query = 'SELECT * FROM ?? WHERE mtImdbID = ?';
        //var table = ["movietomatoes","tt1608290"];
        console.log("So the here siasbh -==========", req.params.imdbID);
        var table = ["movietomatoes", req.params.imdbID];
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("Error happened :- ", err);
                res.json(err);
                //self.connectMysql();
            }
            else {
                query = mysql.format(query, table);
                //console.log(query);
                connection.query(query, function (err, rows) {
                    //if(pool._freeConnections.indexOf(conn) == -1){
                    //    conn.release();
                    //}
                    if (err) {
                        console.log("Error --Here line 417---", err);
                        res.json({"Error": err});
                    } else {
                        console.log("Success");
                        res.json(rows[0]);
                    }
                });
            }
            connection.release();
        });
    });

    //2. Get all from movieinfo
    router.get("/db/movieinfo/:imdbID", function (req,res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("Error happened :- ", err);
                res.json(err);
                //self.connectMysql();
            }
            else {
                //connection.query("SELECT * from movieinfo where infoImdbID = ?",
                connection.query("SELECT mi.* , kim.* FROM movieinfo as mi JOIN moviekidsinmind as kim ON kim.movieKIM_IMDB = mi.infoImdbID WHERE mi.infoImdbID = ?",
                    [req.params.imdbID], function (err, rows) {
                        console.log("Something happening");
                        if (err) {
                            res.json({Error: 'Here line 439 Rest An error occured'});
                        } else {
                            res.json(rows[0]);
                        }
                    });
            }
            connection.release();
        });
    });
    //3. Get all from movieinfo for now showing
    router.get("/db/nowShowing", function (req,res) {
        pool.getConnection(function(err,connection) {
            if(err){
                console.log("Error happened :- ",err);
                res.json(err);
                //self.connectMysql();
            }else {
                connection.query("SELECT ??, ?? , ??, ?? from ??",
                    ["infoMovieID", "infoImdbID", "infoMovieName", "infoMoviePosterPath", "movieinfo"], function (err, rows) {
                        console.log("Something happening");
                        if (err) {
                            res.json({Error: 'Here line 454 An error occured :- ' + err});
                        } else {
                            res.json(rows);
                        }
                    });
            }
            connection.release();
        });
    });

    //4. Get all from upcomingmovies for upcoming
    router.get("/db/upcoming", function (req,res) {
        pool.getConnection(function(err,connection){
            if(err){
                console.log("Error happened :- ",err);
                res.json(err);
                //self.connectMysql();
            }else{
                connection.query("SELECT * from ?? where ?? != '/images/upcomingnull' ORDER BY ?? ",
                    ["upcomingmovies","upPosterPath","upReleaseDate"],function(err, rows){
                        console.log("Something happening");
                        if(err){
                            res.json({ Error: 'here line 470 An error occured' });
                        }else{
                            res.json(rows);
                        }
                    });
            }
            connection.release();
        });
    });

    // 4.1 Delete from Upcoming Movies
    router.delete("/db/upcoming/:upId", function (req,res) {
        pool.getConnection(function(err,connection){
            if(err){
                console.log("Error happened :- ",err);
                res.json(err);
                //self.connectMysql();
            }else{
                connection.query("DELETE FROM ?? where ?? = "+req.params.upId,
                    ["upcomingmovies","upMovieId"],function(err, rows){
                        console.log("Something happening");
                        if(err){
                            res.json({ Error: 'here line 470 An error occured' });
                        }else{
                            res.json(rows);
                        }
                    });
            }
            connection.release();
        });
    });

    //5. Get all from kids in mind
    router.get("/db/kids-in-mind/:imdbID", function (req,res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("Error happened :- ", err);
                res.json(err);
                //self.connectMysql();
            }
            else {
                connection.query("SELECT * from moviekidsinmind where movieKIM_IMDB = ?",
                    [req.params.imdbID], function (err, rows) {
                        //if(pool._freeConnections.indexOf(conn) == -1){
                        //    conn.release();
                        //}
                        console.log("Something happening");
                        if (err) {
                            res.json({Error: 'Here line 439 Rest An error occured'});
                        } else {
                            res.json(rows[0]);
                        }
                    });
            }
            connection.release();
        });
    });

    //Download images from kids in mind rating
    router.get("/download/images/kidsinmind", function(req, res) {
        var one_ten = "http://www.kids-in-mind.com/images/ratings/1to10.jpg"; // one to ten
        var combine = [];
        combine.push(one_ten);
        for (var i =0;i<10;i++){
            combine.push("http://www.kids-in-mind.com/images/ratings/s&n"+(i+1)+".jpg");
            combine.push("http://www.kids-in-mind.com/images/ratings/v&g"+(i+1)+".jpg");
            combine.push("http://www.kids-in-mind.com/images/ratings/prof"+(i+1)+".jpg");
        }
        async.eachSeries(combine, function(url, callback) {
            download(url
                , './app/images/kidsinmind'+url.replace("http://www.kids-in-mind.com/images/ratings",""), function(){
                    console.log('image downloaded');
                });
            callback();
        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process',err);
            } else {
                res.json({"Message":combine});
                console.log('All files have been processed successfully');
            }
        });
    });
    /*Proof of concept*/
    router.delete("/db/delete", function (req,res) {
        pool.getConnection(function(err,connection){
            if(err){
                console.log("Error happened :- ",err);
                res.json(err);
            }else{
                connection.query("DELETE from ?? where ?? = 'tt3498820'",
                    ["movieinfo","infoImdbID"],function(err, rows){
                        console.log("Something happening");
                        if(err){
                            res.json({ Error: 'here line proof of concept An error occured'+err });
                        }else{
                            res.json(rows);
                        }
                    });
            }
            connection.release();
        });
    });
    /*End proof of concept*/

    /*Trial Get Critics Info*/
    router.get("/kidsinmind/rating", function(req, res){
        var alpha = ["a","b","c","d","e","f","g","h","i","j",
                     "k","l","m","n","o","p","q","r","s","t",
                     "u","v","w","x","y","z"];
        var results = "All files have been processed successfully";
        // apha is times to iterate
        var alphaa = ["c"];
        var kidsInMindData = [];
        var x = 0; // increment the kidsinmind array to store rating as well
        var kimIterator = 0;
        var iterator = [];
        async.waterfall([
            function(callback) {
                async.eachSeries(alphaa, function(apl, callbackk) {
                    var url = "http://www.kids-in-mind.com/"+apl+"/index.htm";
                    //console.log(url);
                    reqPro(url).then(function(response){
                        var $ = cheerio.load(response);
                        results = $('p.t11normal').eq(4).filter(function() {
                            k = (this);
                            /*For Fetching the movie names*/
                            for (i = 1; i < k.children.length; i++) {
                                var movieStruct = {"MovieName": "", "Rating": "", "IMDB": ""};
                                //console.log(i);
                                if (k.children[i].children != undefined && k.children[i].children.length != 0) {
                                    movieStruct.MovieName = k.children[i].children[0].data;
                                    movieStruct.Rating = "";
                                    movieStruct.IMDB = "";
                                    kidsInMindData.push(movieStruct);
                                }
                            }
                            /*for fetching the rating*/
                            for(var j =1; j< k.children.length; j++) {
                                if(k.children[j].prev.next.data != undefined && k.children[j].prev.next.data != '\n'
                                    && (k.children[j].prev.next.data).replace(/\s+$/,"") != ''){
                                    kidsInMindData[x].Rating = (k.children[j].prev.next.data).replace("\n","");
                                    //  console.log("***",kidsInMindData[x]);
                                    x++;
                                    if(x>kidsInMindData.length){
                                        x = 0;
                                    }
                                }
                            }
                            /*end fetching the rating*/
                            for(var y=0;y<kidsInMindData.length;y++){
                                var movieName = kidsInMindData[y].MovieName.split(" ");
                                if(movieName[movieName.length-1] == "The"){
                                    kidsInMindData[y].MovieName = "The "+kidsInMindData[y].MovieName.replace(", The","");
                                }
                            }
                            for(var ii = 1; ii< k.children.length; ii++) {
                                //console.log(k.children[ii].attribs.href);
                                if( (k.children[ii].attribs != undefined) &&
                                    ((k.children[ii].attribs).href != undefined) ){
                                    iterator.push(k.children[ii].attribs.href);
                                    //console.log(k.children[ii].attribs.href);
                                }
                            }
                            callbackk();
                        });
                        //callback();
                    });
                    //console.log(apl,"  loaded");
                }, function(err){
                    console.log("done proceesing");
                    callback(null, iterator);
                });
            },
            function(iterator, callback) {
                // arg1 now equals 'one' and arg2 now equals 'two'
                //console.log(iterator, "----", iterator.length);
                for(var i =0; i<iterator.length;i++){
                    console.log(iterator[i],"****",iterator[i].charAt(0));
                }
                console.log(kidsInMindData);
                async.eachSeries(iterator, function(iter, callback){
                    //var u = "http://www.kids-in-mind.com/"+apl+"/"+k.children[ii].attribs.href;
                    if(iter.charAt(0) == '.'){
                        iter = iter.replace(/\.\.\/[a-z]/ ,"");
                        iter = iter.replace(iter.charAt(0),"");
                    }
                    var u = "http://www.kids-in-mind.com/"+iter.charAt(0)+"/"+iter;
                    console.log("currently processing = ",u);
                    //callback();
                    async.waterfall([
                        function(callback) {
                            var u = "http://www.kids-in-mind.com/"+iter.charAt(0)+"/"+iter;
                            //console.log("currently processing = ",u);
                            callback(null, u);
                        },
                        function(u, callback) {
                            reqPro(u).then(function(response){
                                var _$ = cheerio.load(response);
                                try{
                                    if(_$('p.t11normal').eq(3).find('a')[2].attribs == undefined
                                        || _$('p.t11normal').eq(3).find('a')[2] == undefined){
                                        kidsInMindData[kimIterator].IMDB = "notFound";
                                        // console.log(kidsInMindData[kimIterator]);
                                        kimIterator++;
                                    }else {
                                        kidsInMindData[kimIterator].IMDB = _$('p.t11normal').eq(3).find('a')[2].attribs.href
                                            .match(/tt\d{7}/g);
                                        kidsInMindData[kimIterator].IMDB = kidsInMindData[kimIterator].IMDB[0];
                                        console.log(kimIterator,"=-()",kidsInMindData[kimIterator]);
                                        /*Insert them into database*/
                                        var query = "INSERT INTO ?? (??,??,??) VALUES (?,?,?)";
                                        var table = ["moviekidsinmind",
                                            "movieKIM_IMDB",
                                            "movieKIM_MovieName",
                                            "movieKIM_Rating",
                                            kidsInMindData[kimIterator].IMDB,
                                            kidsInMindData[kimIterator].MovieName,
                                            kidsInMindData[kimIterator].Rating];
                                         query = mysql.format(query,table);
                                        pool.getConnection(function(err,connection){
                                            if(err){
                                                console.log("Error happened :- ",err);
                                                //res.json(err);
                                                //self.connectMysql();
                                            }else {
                                                connection.query(query, function (err, rows) {
                                                    if (err) {
                                                        console.log("Here line Error", err.lineNumber);
                                                    } else {
                                                        console.log("Success");
                                                    }
                                                });
                                            }
                                            connection.release();
                                        });
                                        /*End Inserting*/
                                        kimIterator++;
                                        callback(null, 'for');
                                    }
                                }catch (Exception){
                                    kidsInMindData[kimIterator].IMDB = "notFound";
                                    //console.log(kidsInMindData[kimIterator], kimIterator, Exception);
                                    kimIterator++;
                                    callback(null, 'hurray Swapnil you did it');
                                }
                            });
                        }
                    ], function (err, result) {
                        // result now equals 'done'
                        console.log("-----------x---------------------x----------",result);
                        callback();
                    });
                });
                callback(null, 'three');
            },
            function(arg1, callback) {
                // arg1 now equals 'three'
                callback(null, 'done');
            }
        ], function (err, result) {
            // result now equals 'done'
        });
        res.json({"Result":results});
    });
    /*Trial Get Critics Info*/

    /*****************************login logout************************************/
    //1: Registration
    router.post("/db/registerUser",function (req, res){
        // Step 1: Check if user already exists
        console.log("---------------!@#$%^&*()-",sess);
        var userExists = 0;
        var query = 'SELECT COUNT(*) as UserExists FROM ?? WHERE movieUserEmailId = ?';
        var table = ["movieuser",(req.body.emailId).toLowerCase()];
        query = mysql.format(query,table);
          pool.getConnection(function(err,connection){
              if(err){
                  console.log("Error happened :- ",err);
                  res.json(err);
                  //self.connectMysql();
              }else {
                connection.query(query, function (err, rows) {
                  if (err) {
                      res.json({"Error":"Error Occurred"});
                      console.log("====Here line 114 Error", err);
                  } else {
                      userExists = rows[0].UserExists;
                      console.log(userExists);
                      if(userExists == 0){
                          var salt = bcrypt.genSaltSync(10);
                          var hashPassword = bcrypt.hashSync(req.body.password, salt);
                          req.body.id = shortid.generate();
                          req.body.password = hashPassword;
                          query = "INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)";
                          table = ["movieUser","movieUserId","movieUserFirstName","movieUserLastName","movieUserEmailId",
                              "movieUserPassword", req.body.id, req.body.firstName, req.body.lastName, (req.body.emailId).toLowerCase(), req.body.password];
                          query = mysql.format(query,table);
                          pool.getConnection(function(err,connection){
                              if(err){
                                  console.log("Error happened :- ",err);
                                  res.json(err);
                              }else {
                                  connection.query(query, function (err, rows) {
                                      if (err) {
                                          console.log("Here line 114 Error", err);
                                      } else {
                                          res.json({"Message":"User created Successfully", "Details":sess});
                                          console.log("Success");
                                      }
                                  });
                              }
                              connection.release();
                          });
                      }
                      else{
                          res.json({"Error":"User "+(req.body.emailId).toLowerCase()+" already exists please login to continue"});
                      }
                  }
                });
          }
          connection.release();
        });
    });
    //2: Login
    router.post("/db/userLogin", function (req, res){
        sess=req.session;
        sess.email=req.body.emailId;
        res.send(sess);
    });
    //3: Logout
    router.get("/db/userLogout", function (req, res){
        sess = req.session;
        req.session.destroy(function(err){
            if(err){
                res.json({"Error":err});
            }
            else
            {
                res.json({"Message":"Successfully "+sess.email+" logged out"});
            }
        });

    });

    router.get("/check", function (req, res) {
        sess = req.session;
        res.send(sess);
    });
    /******************************login logout***********************************/

};

module.exports = REST_ROUTER;