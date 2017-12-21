/**
 * Created by !!.Swapnil..Aryan.!! on 13-Apr-16.
 */
var mysql = require('mysql');
var reqPro = require('request-promise');
var RottenCrawler = require('./RottenCrawler.js');
var async = require('async');
var apiKey = '2c9306d42037dfb0de0fc3f153819054';
var fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio');
var configJson = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var shortid = require('shortid');
var bcrypt = require('bcryptjs');
// var localstorage = require('node-localstorage');
var conn = '';
var pool = '';
var sess;
var rottenTomatoesURL = '';
// var passport = require('passport')
//   , FacebookStrategy = require('passport-facebook').Strategy;
function REST_ROUTER(router, connection, pool) {
	var self = this;
	conn = connection;
	var rc = new RottenCrawler('For Connection');
	var con = rc.getConnection(conn, pool);
	self.handleRoutes(router, connection, pool);
}

//Run the upcoming api everyday
var cron = require('cron');
var download = function (uri, filename, callback) {
	request.head(uri, function (err, res, body) {
		//console.log('content-type:', res.headers['content-type']);
		//console.log('content-length:', res.headers['content-length']);
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};
//var cronJob = cron.job("00 06 01 * * *", function(){
var cronJob1 = cron.job('* 28 * * * *', function () {
	// perform operation e.g. GET request http.get() etc.
	reqPro('http://localhost:8000/api/upcoming').then(function (response) {
		console.info('cron job completed', response);
	});
	//request('http://localhost:8000/api/upcoming',function(response){
	//    console.log("Started",response);
	//});
	console.info('cron job completed --------------');
});
//cronJob1.start();
var cronJob2 = cron.job('* * * * * *', function () {
	var today = new Date();
	var time = today.toISOString().substring(0, 10);
	/*Delete Released Movies*/
	var query = 'DELETE FROM upcomingmovies WHERE upReleaseDate <= ?';
	var table = [time];
	query = mysql.format(query, table);
	conn.query(query, function (err, rows) {
		if (err) {
			console.log('Error', err);
		} else {
			console.log('Success');
		}
	});
	//conn.release();
	/*End Deleting*/
});
//cronJob2.start();
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

REST_ROUTER.prototype.handleRoutes = function (router, connection, pool) {

	router.get('/profile', passport.authenticationMiddleware(), function(req, res){
		console.log('I came here ');
		res.json({username: req.user.username});
	});
	router.get('/profilee', passport.authenticationMiddleware(), function(req, res){
		var returnMessage = {};
		if(req.user.Error > 0){
			console.log('------------------------------',req.user);
			returnMessage.Message = req.user.Message;
			returnMessage.Error = req.user.Error;
			returnMessage.Status = req.user.Status;
			// req.session.destroy();
		}else {
			returnMessage.message = req.user;
			returnMessage.error = 0;
			returnMessage.status = 'Success login';
			returnMessage.sessionID = req.sessionID;
		}
		res.json(returnMessage);
	});
	router.post('/db/admin/login-admin', passport.authenticate('local'), function (req, res) {
		// user: { Message: 'No User Found', Status: 'Fail', Error: '1' },
		var returnMessage = {};
		if(req.user.Error > 0){
			console.log('------------------------------',req.user);
			returnMessage.Message = req.user.Message;
			returnMessage.Error = req.user.Error;
			returnMessage.Status = req.user.Status;
			// req.session.destroy();
		}else {
			returnMessage.message = req.user;
			returnMessage.error = 0;
			returnMessage.status = 'Success login';
			returnMessage.sessionID = req.sessionID;
		}
		res.json(returnMessage);
		console.log('-----THE END');
	});
	// router.post('/db/admin/login-admin', passport.authenticate('local', {
	// 	successRedirect: 'http://'+configJson.localhost+':'+configJson.sitePort+'/api/profilee',
	// 	failureRedirect: 'http://'+configJson.localhost+':'+configJson.sitePort+'/api/login_n'
	// }));
	/*Test Logging Via Facebook */
	var global_email = null;
	var global_password = null;
	// passport.use(new FacebookStrategy({
	//     clientID: "126030407918627",
	//     clientSecret: "b939974333f8a79344c8974767554a12",
	//     callbackURL: "http://localhost:8000/api/auth/facebook/callback",
	//     profileFields: ['id', 'emails', 'name'] //This
	//   },
	//   function(accessToken, refreshToken, profile, done) {
	//     var fb_result = {
	//       "accessToken":accessToken,
	//       "profile":profile._json
	//     };
	//     console.log(fb_result);
	//     pool.getConnection(function (err, connection) {
	//       if (err) {
	//         console.log("Error happened :- ", err);
	//         res.json(err);
	//       } else {
	//         var salt = bcrypt.genSaltSync(10);
	//         var hashPassword = bcrypt.hashSync(fb_result.profile.email, salt); //here password is same as fb email id
	//         var query = null;
	//         query = "INSERT INTO ??(??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?)";
	//         table = ["movieuser", "movieUserId", "movieUserFirstName", "movieUserLastName",
	//           "movieUserEmailId","movieUserPassword", "movieUserAccessToken","movieUserFBProfileImage",
	//           shortid.generate(), fb_result.profile.first_name, fb_result.profile.last_name,
	//           (fb_result.profile.email).toLowerCase(), hashPassword, fb_result.accessToken,fb_result.profile.fb_image];
	//         query = mysql.format(query, table);
	//         connection.query(query, function (err, rows) {
	//             console.log("Something happening");
	//             if (err) {
	//               return "Error: 'here line proof of concept An error occured'" + err;
	//             } else {
	//               process.nextTick(function () {
	//                 global_password = (fb_result.profile.email).toLowerCase();
	//                 global_email = (fb_result.profile.email).toLowerCase();
	//                 return done(null, profile);
	//               });
	//             }
	//           });
	//       }
	//       connection.release();
	//     });
	//   }
	// ));
	// passport.serializeUser(function(user, done) {
	//   console.log("Serializer------",user);
	//   done(null, user);
	// });
	//
	// passport.deserializeUser(function(user, done) {
	//   console.log("DE--Serializer------",user);
	//
	//   done(null, user);
	// });

	// router.get('/auth/facebook', passport.authenticate('facebook',  { authType: 'rerequest', scope: ['email'] }));
	// router.get('/auth/facebook/callback',
	//   passport.authenticate('facebook', { failureRedirect: '/db/nowShowing' }),
	//   function (req, res) {
	//     var url = 'http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/userLogin';
	//
	//     request({
	//       url: url,
	//       method: "POST",
	//       json: true,   // <--Very important!!!
	//       body: {emailId:global_email, password: global_password}
	//     }, function (error, response, body){
	//       console.log(response);
	//     });
	//
	//     // reqPro.post( url,)
	//     //   .then(function (response) {
	//     //     console.log(response);
	//     //   })  ;
	//     res.redirect('http://localhost:9000/#/');
	//     // res.json("Yo Bro")
	//   }
	// );

	router.post('/db/fblogin', function (req, res) {
		var fb_result = req.body;
		console.log('fb_result', fb_result);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				var user_shortId = shortid.generate();
				var salt = bcrypt.genSaltSync(10);
				var hashPassword = bcrypt.hashSync(fb_result.email, salt); //here password is same as fb email id
				var query = null;
				query = 'INSERT INTO ??(??,??,??,??,??,??, ??, ??) VALUES (?,?,?,?,?,?, ?,?)' +
					'ON DUPLICATE KEY UPDATE ?? = ?, ?? = ?';
				table = ['movieuser', 'movieUserId', 'movieUserFirstName', 'movieUserLastName',
					'movieUserEmailId', 'movieUserPassword', 'movieUserAccessToken', 'movieUserFBID', 'movieUserFBProfileImage',
					user_shortId, fb_result.first_name, fb_result.last_name,
					(fb_result.email).toLowerCase(), hashPassword, fb_result.accessToken, fb_result.id, fb_result.fb_image,
					'movieUserAccessToken', fb_result.accessToken, 'movieUserFBProfileImage', fb_result.fb_image
				];
				query = mysql.format(query, table);
				connection.query(query, function (err, rows) {
					console.log('Something happening');
					if (err) {
						return 'Error: \'here line proof of concept An error occured\'' + err;
					} else {
						console.log('Rows', rows);
						res.json({
							'fb_mail': (fb_result.email).toLowerCase(),
							'fb_first_name': fb_result.first_name,
							'fb_last_name': fb_result.last_name
						});
					}
				});
			}
			connection.release();
		});
	});
	router.get('/upcoming', function (req, res) {
		var items = [1];
		var totPage = [];
		var ret = [];
		async.eachSeries(items, function (item, callback) {
			var url = 'http://api.themoviedb.org/3/movie/upcoming?api_key=' + apiKey + '&page=' + item + '&language=en';
			reqPro(url).then(function (response) {
				for (var i = 1; i <= JSON.parse(response).total_pages; i++) {
					totPage.push(i);
				}
				callback();
			});
		}, function (err) {
			if (err) {
				console.log('Some Error happened at url fetching. Do manually', err);
			} else {
				console.log('All Upcoming Movies Fetched');
				async.eachSeries(totPage, function (item, callback) {
					// Perform operation on file here.
					var url = 'http://api.themoviedb.org/3/movie/upcoming?api_key=' + apiKey + '&page=' + item + '&language=en';
					reqPro(url).then(function (response) {
						var t = [];
						for (var x = 0; x < JSON.parse(response).results.length; x++) {
							t.push(x);
						}
						async.eachSeries(t, function (i, callback) {
							var upC = {
								'id': '',
								'title': '',
								'release_date': '',
								'poster_path': '',
								'original_language': '',
								'page': ''
							};
							if (JSON.parse(response).results[i].original_language == 'en') {
								/*async.series([
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
								 });*/
								upC['id'] = JSON.parse(response).results[i].id;
								upC['page'] = JSON.parse(response).page;
								upC['title'] = JSON.parse(response).results[i].title;
								upC['release_date'] = JSON.parse(response).results[i].release_date;
								upC['poster_path'] = '/images/upcoming' + JSON.parse(response).results[i].poster_path;
								upC['original_language'] = JSON.parse(response).results[i].original_language;

								/*Adding to Database*/
								var query = 'INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)';
								var table = ['admin_upcomingmovies', 'upMovieId', 'upMovieName', 'upReleaseDate', 'upPosterPath',
									JSON.parse(response).results[i].id,
									JSON.parse(response).results[i].title,
									JSON.parse(response).results[i].release_date,
									'/images/upcoming' + JSON.parse(response).results[i].poster_path
								];
								query = mysql.format(query, table);
								pool.getConnection(function (err, connection) {
									if (err) {
										console.log('Error happened :- ', err);
										res.json(err);
									} else {
										connection.query(query, function (err, rows) {
											if (err) {
												console.log('Here line 114 Error', err);
											} else {
												console.log('Success');
											}
										});
									}
									connection.release();
								});
								/*End adding*/

								if (JSON.parse(response).results[i].poster_path != null) {
									var ll = [i];
									async.eachSeries(ll, function (i, callback) {
										download('http://image.tmdb.org/t/p/w500' + JSON.parse(response).results[i].poster_path, '' + configJson.imageLocation + '/images/upcoming/' + JSON.parse(response).results[i].poster_path, function () {
											console.log('image downloaded');
										});
										callback();
									}, function (err) {
										// if any of the file processing produced an error, err would equal that error
										if (err) {
											// One of the iterations produced an error.
											// All processing will now stop.
											console.log('A file failed to process', err);
										} else {
											console.log('All files have been processed successfully');
										}
									});
								}
								ret.push(upC);
								//console.log("ret is ",ret);
							}
							callback();
						}, function (err) {
							// if any of the file processing produced an error, err would equal that error
							if (err) {
								// One of the iterations produced an error.
								// All processing will now stop.
								console.log('A file failed to process', err);
							} else {
								console.log('All files have been processed successfully');
							}
						});
						callback();
					});
				}, function (err) {
					// if any of the file  processing produced an error, err would equal that error
					if (err) {
						// One of the iterations produced an error.
						// All processing will now stop.
						console.log('A file failed to process', err);
					} else {
						console.log('All files have been processed successfully *****', totPage);
						res.json(ret);
					}
				});
			}
		});
	});
	router.get('/rt/:movie_name', function (req, res) {
		var rc = new RottenCrawler();
		rc.getMovieInfo()
			.then(function () {
				res.json(rc);
			});
	});
	router.get('/rt/:movie_name/critics', function (req, res) {
		//console.log(req.params.movie_name);
		var rc = new RottenCrawler('/m/' + req.params.movie_name + '/');
		rc.getCriticsInfo()
			.then(function () {
				res.json(rc);
			});
	});
	router.get('/rotten_tomatoes/:movie_name', function (req, res) {
		var rc = new RottenCrawler(req.params.movie_name);
		var tomatoURL = '';
		var imdb_id = '';
		var crawlTomatoData = '';
		async.series([
			function (callback) {
				// callback();
				rc.theMovieDB()
					.then(function () {
						console.log(rc.movieResponse['movieInfo']);
						imdb_id = (rc.movieResponse['movieInfo'][0].imdb_id);
						// tomatoURL = (rc.movieResponse["omdbData"][0].tomatoURL)?rc.movieResponse["omdbData"][0].tomatoURL : "N/A";
						tomatoURL = (rc.movieResponse['omdbData']) ? rc.movieResponse['omdbData'][0].tomatoURL : 'N/A';
						if (tomatoURL != 'N/A') {
							tomatoURL = tomatoURL.replace('http://www.rottentomatoes.com', '');
						}
						console.log('Done', tomatoURL, imdb_id);
						callback();
					});
			},
			function (callback) {
				var rc = new RottenCrawler(tomatoURL);
				// callback();
				rc.getMovieInfo()
					.then(function () {
						crawlTomatoData = rc.crawlTomato;
						callback();
					});
			}
		], function (err) {
			if (err) {
				res.json({
					'Error': true,
					'Message': 'Error Details:- ' + err
				});
			} else {
				res.json({
					'Error': false,
					'Message': 'Success'
				});
			}
		});
	});
	router.get('/the_movie_db/:movie_name', function (req, res) {
		/*Using Async WaterFall Model to collect Data for the year 2016*/
		var date = new Date();
		var year = date.getFullYear();
		var searchElementID = '';
		var url = 'http://api.themoviedb.org/3/search/movie?api_key=' + apiKey + '&query=' + req.params.movie_name + '&year=' + year;
		var re = {};
		async.waterfall([
			//1stly Search Movies via apiary/search/movie
			function (callback) {
				reqPro(url).then(function (response) {
					var ret = JSON.parse(response).results;
					//console.log(re.response[0].poster_path);
					// if movie not found
					//console.log("total results",response,);
					if (JSON.parse(response).total_results != 0) {
						if (ret[0].poster_path != null) {
							download('http://image.tmdb.org/t/p/w500' + ret[0].poster_path, '' + configJson.imageLocation + '/images/nowShowing' + ret[0].poster_path, function () {
								console.log('saved image');
							});
						}
						callback(null, ret[0].id);
					} else {
						res.json({
							'Error': true,
							'Message': 'No Movies Found'
						});
					}
				});
			},
			function (id, callback) {
				// id now equals 2nd parameter from previous callback
				//2ndly get movie details as per id(set by apiary)
				var url2 = 'http://api.themoviedb.org/3/movie/' + id + '?api_key=' + apiKey;
				reqPro(url2).then(function (response) {
					re.movieDetails = JSON.parse(response);
					//console.log(JSON.parse(response));
					callback(null, re.movieDetails.imdb_id, id);
				});
			},
			function (imdb_id, id, callback) {
				//3rdly call OMDB API for extra results
				searchElementID = id;
				var url3 = 'http://www.omdbapi.com/?i=' + imdb_id + '&plot=full&r=json&tomatoes=true';
				reqPro(url3).then(function (response) {
					re.omdbData = JSON.parse(response);
					callback(null, id);
				});
			},
			//lastly call the casts and crews
			function (id, callback) {
				var url4 = 'http://api.themoviedb.org/3/movie/' + id + '/credits?api_key=' + apiKey;
				reqPro(url4).then(function (response) {
					re.credits = JSON.parse(response);
					//console.log(";;;;;",re.credits.cast.length);
					var times2iterate = [];
					for (var i = 0; i < re.credits.cast.length; i++) {
						times2iterate.push(i);
					}
					//save cast images to credits
					async.eachSeries(times2iterate, function (i, callback) {
							if (re.credits.cast[i].profile_path != null) {
								download('http://image.tmdb.org/t/p/w500' + re.credits.cast[i].profile_path, '' + configJson.imageLocation + '/images/credits' + re.credits.cast[i].profile_path, function () {
									console.log('saved image');
								});
							}
							callback();
						},
						function (err) {
							// if any of the file processing produced an error, err would equal that error
							if (err) {
								// One of the iterations produced an error.
								// All processing will now stop.
								res.json({
									'Error': true,
									'Message': err
								});
								console.log('A file failed to process', err);
							} else {
								console.log('All files have been processed successfully');
								//res.json(ret);
							}
						});
					callback(null, re);
				});
			},
			//Now we are ready to save them to database
			function (toBeSaved, callback) {

				toBeSaved.movieDetails.id = (toBeSaved.movieDetails.id) ? toBeSaved.movieDetails.id : 'N/A';
				toBeSaved.movieDetails.imdb_id = (toBeSaved.movieDetails.imdb_id) ? toBeSaved.movieDetails.imdb_id : 'N/A';
				toBeSaved.omdbData.Title = (toBeSaved.omdbData.Title) ? toBeSaved.omdbData.Title : 'N/A';
				toBeSaved.omdbData.Released = (toBeSaved.omdbData.Released) ? toBeSaved.omdbData.Released : 'N/A';
				toBeSaved.omdbData.Runtime = (toBeSaved.omdbData.Runtime) ? toBeSaved.omdbData.Runtime : 'N/A';
				toBeSaved.omdbData.Rated = (toBeSaved.omdbData.Rated) ? toBeSaved.omdbData.Rated : 'N/A';
				toBeSaved.omdbData.Writer = (toBeSaved.omdbData.Writer) ? toBeSaved.omdbData.Writer : 'N/A';
				toBeSaved.omdbData.Genre = (toBeSaved.omdbData.Genre) ? toBeSaved.omdbData.Genre : 'N/A';
				toBeSaved.omdbData.imdbRating = (toBeSaved.omdbData.imdbRating) ? toBeSaved.omdbData.imdbRating : 'N/A';
				toBeSaved.omdbData.Production = (toBeSaved.omdbData.Production) ? toBeSaved.omdbData.Production : 'N/A';
				toBeSaved.omdbData.Production = (toBeSaved.omdbData.Production) ? toBeSaved.omdbData.Production : 'N/A';
				toBeSaved.omdbData.Website = (toBeSaved.omdbData.Website) ? toBeSaved.omdbData.Website : 'N/A';
				//toBeSaved.omdbData.Plot = (toBeSaved.omdbData.Plot)?toBeSaved.omdbData.Plot:"N/A";
				// This is just alternative of OMDB... fetching from themovieapiary
				toBeSaved.omdbData.Plot = (toBeSaved.movieDetails.overview) ? toBeSaved.movieDetails.overview : 'N/A';
				toBeSaved.movieDetails.poster_path = (toBeSaved.movieDetails.poster_path) ? toBeSaved.movieDetails.poster_path : 'N/A';
				toBeSaved.omdbData.BoxOffice = (toBeSaved.omdbData.BoxOffice) ? toBeSaved.omdbData.BoxOffice : 'N/A';
				rottenTomatoesURL = toBeSaved.omdbData.tomatoURL;
				/*End Beautifying data*/
				/*Adding to Database*/
				var query = 'INSERT INTO admin_movieinfo ' +
					'(infoMovieID, ' +
					'infoImdbID, ' +
					'infoMovieName,' +
					'infoMovieInTheatres, ' +
					'infoMovieRuntime, ' +
					'infoMovieRated, ' +
					'infoMovieDirectedBy, ' +
					'infoMovieWrittenBy, ' +
					'infoMovieGenre, ' +
					'infoMovieImdbRating, ' +
					'infoMovieProduction, ' +
					'infoMovieWebsite, ' +
					'infoMovieDescription, ' +
					'infoMoviePosterPath, ' +
					'infoMovieCasts, ' +
					'infoMovieBoxOffice) VALUES ' +
					'(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
					'/images/nowShowing' + toBeSaved.movieDetails.poster_path,
					JSON.stringify(toBeSaved.credits.cast),
					toBeSaved.omdbData.BoxOffice
				];
				pool.getConnection(function (err, connection) {
					if (err) {
						console.log('Error happened :- ', err);
						res.json(err);
						//self.connectMysql();
					} else {
						query = mysql.format(query, table);
						//console.log(query);
						connection.query(query, function (err, rows) {
							if (err) {
								console.log('Here line 370 Error', err);
							} else {
								console.log('Success ----*********', rows);
							}
						});
					}
					connection.release();
				});
				/*End adding*/
				callback(null, toBeSaved);
			}
		], function (err, result) {
			console.log(';;;;;;;;;;;;;;;;;;;;;;;;', result);
			// result now equals 'done'
			if (err) {
				res.json({
					'Error': true,
					'Message': err
				});
			} else {
				console.log('seacrghc ekelment is ', searchElementID);
				var query = 'SELECT * FROM ?? WHERE infoMovieID = ?';
				var table = ['admin_movieinfo', searchElementID];
				pool.getConnection(function (err, connection) {
					if (err) {
						console.log('Error happened :- ', err);
						res.json(err);
						//self.connectMysql();
					} else {
						var qquery = mysql.format(query, table);
						//console.log(query);
						connection.query(qquery, function (err, rows) {
							if (err) {
								console.log('Here line 393 Error', err);
							} else {
								console.log('Success ', rows);
								res.json(rows);
							}
						});
					}
					connection.release();
				});
			}
		});
		/*End Waterfall*/
	});
	/*Fetch from our database*/
	// 1. Get all from movietomatoes
	router.get('/db/rottenTomatoes/:imdbID', function (req, res) {
		var query = 'SELECT * FROM ?? WHERE mtImdbID = ?';
		//var table = ["movietomatoes","tt1608290"];
		console.log('So the here siasbh -==========', req.params.imdbID);
		var table = ['movietomatoes', req.params.imdbID];
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				query = mysql.format(query, table);
				//console.log(query);
				connection.query(query, function (err, rows) {
					//if(pool._freeConnections.indexOf(conn) == -1){
					//    conn.release();
					//}
					if (err) {
						console.log('Error --Here line 417---', err);
						res.json({
							'Error': err
						});
					} else {
						console.log('Success');
						res.json(rows[0]);
					}
				});
			}
			connection.release();
		});
	});
	//2. Get all from movieinfo
	router.get('/db/movieinfo/:imdbID', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				//connection.query("SELECT * from movieinfo where infoImdbID = ?",
				connection.query('SELECT mi.* , kim.* FROM movieinfo as mi ' +
					'LEFT JOIN moviekidsinmind as kim ' +
					'ON kim.movieKIM_IMDB = mi.infoImdbID ' +
					'WHERE mi.infoImdbID = ?', [req.params.imdbID],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'Here line 439 Rest An error occured'
							});
						} else {
							res.json(rows[0]);
						}
					});
			}
			connection.release();
		});
	});
	//3. Get all from movieinfo for now showing
	router.get('/db/nowShowing', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				connection.query('SELECT ??, ?? , ??, ??, ?? from ??', ['infoMovieID', 'infoImdbID', 'infoMovieName', 'infoMoviePosterPath', 'infoMovieBuyTicketsButton', 'movieinfo'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'Here line 454 An error occured :- ' + err
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});

	//4. Get all from upcoming movies for upcoming
	router.get('/db/upcoming', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				connection.query('SELECT * from ?? where ?? != \'/images/upcomingnull\' ' +
					'AND ?? BETWEEN ((DATE_SUB( CURDATE() ,INTERVAL -1 DAY))) AND (DATE_SUB( CURDATE() ,INTERVAL -20 DAY))  ORDER BY ?? ', ['upcomingmovies', 'upPosterPath', 'upReleaseDate', 'upReleaseDate'],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'here line 470 An error occured'
							});
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});

	// 4.1 Delete from Upcoming Movies
	router.delete('/db/upcoming/:upId', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				connection.query('DELETE FROM ?? where ?? = ' + req.params.upId, ['upcomingmovies', 'upMovieId'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line 470 An error occured'
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});

	//5. Get all from kids in mind
	router.get('/db/kids-in-mind/:imdbID', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				connection.query('SELECT * from moviekidsinmind where movieKIM_IMDB = ?', [req.params.imdbID], function (err, rows) {
					//if(pool._freeConnections.indexOf(conn) == -1){
					//    conn.release();
					//}
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'Here line 439 Rest An error occured'
						});
					} else {
						res.json(rows[0]);
					}
				});
			}
			connection.release();
		});
	});

	//Download images from kids in mind rating
	router.get('/download/images/kidsinmind', function (req, res) {
		var one_ten = 'http://www.kids-in-mind.com/images/ratings/1to10.jpg'; // one to ten
		var combine = [];
		combine.push(one_ten);
		for (var i = 0; i < 10; i++) {
			combine.push('http://www.kids-in-mind.com/images/ratings/s&n' + (i + 1) + '.jpg');
			combine.push('http://www.kids-in-mind.com/images/ratings/v&g' + (i + 1) + '.jpg');
			combine.push('http://www.kids-in-mind.com/images/ratings/prof' + (i + 1) + '.jpg');
		}
		async.eachSeries(combine, function (url, callback) {
			download(url, '' + configJson.imageLocation + '/images/kidsinmind' + url.replace('http://www.kids-in-mind.com/images/ratings', ''), function () {
				console.log('image downloaded');
			});
			callback();
		}, function (err) {
			// if any of the file processing produced an error, err would equal that error
			if (err) {
				// One of the iterations produced an error.
				// All processing will now stop.
				console.log('A file failed to process', err);
			} else {
				res.json({
					'Message': combine
				});
				console.log('All files have been processed successfully');
			}
		});
	});
	/*Proof of concept*/
	router.delete('/db/delete', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('DELETE from ?? where ?? = \'tt3498820\'', ['movieinfo', 'infoImdbID'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});
	/*End proof of concept*/

	/*Trial Get Critics Info*/
	router.get('/kidsinmind/rating', function (req, res) {
		var alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
			'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
			'u', 'v', 'w', 'x', 'y', 'z'
		];
		var results = 'All files have been processed successfully';
		// apha is times to iterate
		var alphaa = ['c'];
		var kidsInMindData = [];
		var x = 0; // increment the kidsinmind array to store rating as well
		var kimIterator = 0;
		var iterator = [];
		async.waterfall([
			function (callback) {
				console.log('kutdktud');
				async.eachSeries(alphaa, function (apl, callbackk) {
					var url = 'http://www.kids-in-mind.com/' + apl + '/index.htm';
					console.log(url);
					reqPro(url).then(function (response) {
						var $ = cheerio.load(response);
						results = $('p.t11normal').eq(4).filter(function () {
							k = (this);
							/*For Fetching the movie names*/
							for (i = 1; i < k.children.length; i++) {
								var movieStruct = {
									'MovieName': '',
									'Rating': '',
									'IMDB': ''
								};
								//console.log(i);
								if (k.children[i].children != undefined && k.children[i].children.length != 0) {
									movieStruct.MovieName = k.children[i].children[0].data;
									movieStruct.Rating = '';
									movieStruct.IMDB = '';
									kidsInMindData.push(movieStruct);
								}
							}
							/*for fetching the rating*/
							for (var j = 1; j < k.children.length; j++) {
								if (k.children[j].prev.next.data != undefined && k.children[j].prev.next.data != '\n' &&
									(k.children[j].prev.next.data).replace(/\s+$/, '') != '') {
									kidsInMindData[x].Rating = (k.children[j].prev.next.data).replace('\n', '');
									//  console.log("***",kidsInMindData[x]);
									x++;
									if (x > kidsInMindData.length) {
										x = 0;
									}
								}
							}
							/*end fetching the rating*/
							for (var y = 0; y < kidsInMindData.length; y++) {
								var movieName = kidsInMindData[y].MovieName.split(' ');
								if (movieName[movieName.length - 1] == 'The') {
									kidsInMindData[y].MovieName = 'The ' + kidsInMindData[y].MovieName.replace(', The', '');
								}
							}
							for (var ii = 1; ii < k.children.length; ii++) {
								//console.log(k.children[ii].attribs.href);
								if ((k.children[ii].attribs != undefined) &&
									((k.children[ii].attribs).href != undefined)) {
									iterator.push(k.children[ii].attribs.href);
									//console.log(k.children[ii].attribs.href);
								}
							}
							callbackk();
						});
						//callback();
					});
					console.log(apl, '  loaded');
				}, function (err) {
					console.log('done proceesing');
					callback(null, iterator);
				});
			},
			function (iterator, callback) {
				// arg1 now equals 'one' and arg2 now equals 'two'
				//console.log(iterator, "----", iterator.length);
				for (var i = 0; i < iterator.length; i++) {
					console.log(iterator[i], '****', iterator[i].charAt(0));
				}
				console.log(kidsInMindData);
				async.eachSeries(iterator, function (iter, callback) {
					//var u = "http://www.kids-in-mind.com/"+apl+"/"+k.children[ii].attribs.href;
					if (iter.charAt(0) == '.') {
						iter = iter.replace(/\.\.\/[a-z]/, '');
						iter = iter.replace(iter.charAt(0), '');
					}
					var u = 'http://www.kids-in-mind.com/' + iter.charAt(0) + '/' + iter;
					console.log('currently processing = ', u);
					//callback();
					async.waterfall([
						function (callback) {
							var u = 'http://www.kids-in-mind.com/' + iter.charAt(0) + '/' + iter;
							//console.log("currently processing = ",u);
							callback(null, u);
						},
						function (u, callback) {
							reqPro(u).then(function (response) {
								var _$ = cheerio.load(response);
								try {
									if (_$('p.t11normal').eq(3).find('a')[2].attribs == undefined ||
										_$('p.t11normal').eq(3).find('a')[2] == undefined) {
										kidsInMindData[kimIterator].IMDB = 'notFound';
										// console.log(kidsInMindData[kimIterator]);
										kimIterator++;
									} else {
										kidsInMindData[kimIterator].IMDB = _$('p.t11normal').eq(3).find('a')[2].attribs.href
											.match(/tt\d{7}/g);
										kidsInMindData[kimIterator].IMDB = kidsInMindData[kimIterator].IMDB[0];
										console.log(kimIterator, '=-()', kidsInMindData[kimIterator]);
										/*Insert them into database*/
										var query = 'INSERT INTO ?? (??,??,??) VALUES (?,?,?)';
										var table = ['moviekidsinmind',
											'movieKIM_IMDB',
											'movieKIM_MovieName',
											'movieKIM_Rating',
											kidsInMindData[kimIterator].IMDB,
											kidsInMindData[kimIterator].MovieName,
											kidsInMindData[kimIterator].Rating
										];
										query = mysql.format(query, table);
										pool.getConnection(function (err, connection) {
											if (err) {
												console.log('Error happened :- ', err);
												//res.json(err);
												//self.connectMysql();
											} else {
												connection.query(query, function (err, rows) {
													if (err) {
														console.log('Here line Error', err.lineNumber);
													} else {
														console.log('Success');
													}
												});
											}
											connection.release();
										});
										/*End Inserting*/
										kimIterator++;
										callback(null, 'for');
									}
								} catch (Exception) {
									kidsInMindData[kimIterator].IMDB = 'notFound';
									//console.log(kidsInMindData[kimIterator], kimIterator, Exception);
									kimIterator++;
									callback(null, 'hurray Swapnil you did it');
								}
							});
						}
					], function (err, result) {
						// result now equals 'done'
						console.log('-----------x---------------------x----------', result);
						callback();
					});
				});
				callback(null, 'three');
			},
			function (arg1, callback) {
				// arg1 now equals 'three'
				callback(null, 'done');
			}
		], function (err, ressult) {
			// result now equals 'done'
			if (ressult == 'done') {
				res.json({
					'Result': results
				});
			} else {
				console.log('32564476598');
			}
			console.log('ertjyghjm');
		});
	});
	/*Trial Get Critics Info*/

	/*****************************login logout************************************/
	//1: Registration
	router.post('/db/registerUser', function (req, res) {
		// Step 1: Check if user already exists
		console.log(req.body);
		var userExists = 0;
		var query = 'SELECT COUNT(*) as UserExists FROM ?? WHERE movieUserEmailId = ?';
		var table = ['movieuser', (req.body.emailId).toLowerCase()];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occured',
					'Status': 'Fail'
				});
				//self.connectMysql();
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						res.json({
							'Error': 'Error Occurred',
							'Status': 'Fail'
						});
						console.log('====Here line 114 Error', err);
					} else {
						userExists = rows[0].UserExists;
						if (userExists == 0) {
							var passwords_match = false;
							var salt = bcrypt.genSaltSync(10);
							var hashPassword = bcrypt.hashSync(req.body.password, salt);
							req.body.id = shortid.generate();
							req.body.password = hashPassword;
							passwords_match = bcrypt.compareSync(req.body.confirm_password, hashPassword);
							if (passwords_match == false) {
								res.json({
									'Message': 'Passwords don\'t match',
									'Status': 'Fail'
								});
							} else {
								query = 'INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)';
								table = ['movieuser', 'movieUserId', 'movieUserFirstName', 'movieUserLastName', 'movieUserEmailId',
									'movieUserPassword', req.body.id, req.body.firstName, req.body.lastName, (req.body.emailId).toLowerCase(), req.body.password
								];
								query = mysql.format(query, table);
								pool.getConnection(function (err, connection) {
									if (err) {
										console.log('Error happened :- ', err);
										res.json({
											'Message': 'Error occured',
											'Status': 'Fail'
										});
									} else {
										connection.query(query, function (err, rows) {
											if (err) {
												console.log('Here line 114 Error', err);
											} else {
												res.json({
													'Message': 'User created Successfully',
													'Details': sess,
													'Status': 'Success'
												});
												console.log('Success');
											}
										});
									}
									connection.release();
								});
							}
						} else {
							res.json({
								'Error': 'User ' + (req.body.emailId).toLowerCase() + ' already exists please login to continue',
								'Status': 'Fail'
							});
						}
					}
				});
			}
			connection.release();
		});
	});
	//2: Login
	router.post('/db/userLogin', function (req, res) {
		var matchPassword;
		sess = req.session;
		console.log('Session ',sess);
		sess.email = req.body.emailId;
		sess.password = req.body.password;
		// Fetch the details from the db of given email
		var query = 'SELECT * FROM ?? WHERE movieUserEmailId = ?';
		var table = ['movieuser', (req.body.emailId).toLowerCase()];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occured' + err,
					'Status': 'Fail'
				});
				//self.connectMysql();
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						if (rows.length > 0) {
							matchPassword = rows[0].movieUserPassword;
							var isMatch = bcrypt.compareSync(sess.password, matchPassword);
							if (isMatch) {
								res.json({
									'Message': 'Logged in Successfully',
									'Details': sess,
									'Status': 'Success'
								});
							} else {
								res.json({
									'Message': 'Wrong Password',
									'Status': 'Fail'
								});
							}
							console.log('Success');
						} else {
							res.json({
								'Message': 'No such email ' + req.body.emailId + '. Please SignUp to continue',
								'Status': 'Fail'
							});
						}

					}
				});
			}
			connection.release();
		});
	});
	//3: Logout
	router.get('/db/userLogout', function (req, res) {
		req.session = sess;
		if (sess == undefined) {
			res.json({
				'Message': 'No user is logged in.',
				'status': 'Fail'
			});
		} else {
			req.session.destroy(function (err) {
				if (err) {
					res.json({
						'Error': err
					});
				} else {
					res.json({
						'Message': 'Successfully ' + sess.email + ' logged out'
					});
				}
			});
		}
	});

	router.get('/db/check', function (req, res) {
		req.session = sess;
		res.send(sess);
	});
	/******************************login logout***********************************/

	/******************************Admin Panel************************************/
	/*Admin Setting :- Admin User*/
	// GET and POST Admin User Login and Registration
	// 1. Registration
	router.post('/db/admin/register-admin', function (req, res) {
		// Step 1: Check if user already exists
		console.log(req.body);
		var userExists = 0;
		var query = 'SELECT COUNT(*) as UserExists FROM ?? WHERE adminUserEmail = ?';
		var table = ['admin_user', (req.body.adminUserEmail).toLowerCase()];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occurred',
					'Status': 'Fail'
				});
				//self.connectMysql();
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						res.json({
							'Error': 'Error Occurred',
							'Status': 'Fail'
						});
						console.log('====Here line 114 Error', err);
					} else {
						userExists = rows[0].UserExists;
						if (userExists == 0) {
							var passwords_match = false;
							var salt = bcrypt.genSaltSync(10);
							var hashPassword = bcrypt.hashSync(req.body.password, salt);
							req.body.adminUserID = shortid.generate();
							req.body.password = hashPassword;
							passwords_match = bcrypt.compareSync(req.body.confirm_password, hashPassword);
							if (passwords_match == false) {
								res.json({
									'Message': 'Passwords don\'t match',
									'Status': 'Fail'
								});
							} else {
								query = 'INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)';
								table = ['admin_user', 'adminUserID', 'adminUserName', 'adminUserEmail', 'adminUserPassword',
									req.body.adminUserID, req.body.adminUserName, (req.body.adminUserEmail).toLowerCase(), req.body.password
								];
								query = mysql.format(query, table);
								pool.getConnection(function (err, connection) {
									if (err) {
										console.log('Error happened :- ', err);
										res.json({
											'Message': 'Error occured',
											'Status': 'Fail'
										});
									} else {
										connection.query(query, function (err, rows) {
											if (err) {
												console.log('Here line 114 Error', err);
											} else {
												res.json({
													'Message': 'User created Successfully',
													'Details': sess,
													'Status': 'Success'
												});
												console.log('Success');
											}
										});
									}
									connection.release();
								});
							}
						} else {
							res.json({
								'Error': 'User ' + (req.body.adminUserEmail).toLowerCase() + ' already exists please login to continue',
								'Status': 'Fail'
							});
						}
					}
				});
			}
			connection.release();
		});
	});
	// 2. Admin Login
	router.post('/db/admin/login-admin', function (req, res) {
		var matchPassword;
		sess = req.session;
		sess.email = req.body.adminUserEmail;
		sess.password = req.body.password;
		console.log('Admin Session',sess);
		// Fetch the details from the db of given email
		var query = 'SELECT * FROM ?? WHERE adminUserEmail = ?';
		var table = ['admin_user', (req.body.adminUserEmail).toLowerCase()];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occured' + err,
					'Status': 'Fail'
				});
				//self.connectMysql();
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						if (rows.length > 0) {
							matchPassword = rows[0].adminUserPassword;
							var isMatch = bcrypt.compareSync(sess.password, matchPassword);
							if (isMatch) {
								res.json({
									'Message': 'Logged in Successfully',
									'Details': sess,
									'Status': 'Success'
								});
							} else {
								res.json({
									'Message': 'Wrong Password',
									'Status': 'Fail'
								});
							}
							console.log('Success');
						} else {
							res.json({
								'Message': 'No such email ' + req.body.emailId + '. Please SignUp to continue',
								'Status': 'Fail'
							});
						}

					}
				});
			}
			connection.release();
		});
	});
	// 3. Admin Logout
	router.get('/db/admin/logout-admin', function (req, res) {
		req.session = sess;
		if (sess == undefined) {
			res.json({
				'Message': 'No user is logged in.',
				'status': 'Fail'
			});
		} else {
			req.session.destroy(function (err) {
				if (err) {
					res.json({
						'Error': err
					});
				} else {
					res.json({
						'Message': 'Successfully ' + sess.email + ' logged out'
					});
				}
			});
		}
	});
	// 4. Get Admin User Details
	router.get('/db/admin/get-admin-user', function (req, res) {
		var matchPassword;
		req.session = sess;
		// Fetch the details from the db of given email
		var query = 'SELECT * FROM ?? WHERE adminUserEmail = ?';
		var table = ['admin_user', (req.session.email).toLowerCase()];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occured' + err,
					'Status': 'Fail'
				});
				//self.connectMysql();
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						if (rows.length > 0) {
							matchPassword = rows[0].adminUserPassword;
							var isMatch = bcrypt.compareSync(sess.password, matchPassword);
							if (isMatch) {
								res.json({
									'Message': rows[0],
									'Status': 'Success'
								});
							} else {
								res.json({
									'Message': 'Passwords do not match. Please login to continue',
									'Status': 'Fail'
								});
							}
							console.log('Success');
						} else {
							res.json({
								'Message': 'No such email ' + req.session.email + '. Please SignUp to continue',
								'Status': 'Fail'
							});
						}
					}
				});
			}
			connection.release();
		});
	});
	// 5. Update Admin User Details
	router.put('/db/admin/update-admin-user', function (req, res) {
		req.session = sess;
		if (sess == undefined) {
			res.json({
				'Message': 'No user is logged in.',
				'status': 'Fail'
			});
		} else {
			var passwords_match = false;
			var salt = bcrypt.genSaltSync(10);
			var hashPassword = bcrypt.hashSync(req.body.password, salt);
			req.body.password = hashPassword;
			passwords_match = bcrypt.compareSync(req.body.confirm_password, hashPassword);
			if (passwords_match == false) {
				res.json({
					'Message': 'Passwords don\'t match',
					'Status': 'Fail'
				});
			} else {
				query = 'UPDATE ?? SET ??=?, ??=?, ??=?, ??=? WHERE ??=?';
				table = ['admin_user', 'adminUserID', req.body.adminUserID, 'adminUserName', req.body.adminUserName,
					'adminUserEmail', (req.body.adminUserEmail).toLowerCase(), 'adminUserPassword', req.body.password,
					'adminUserEmail', (req.body.adminUserEmail).toLowerCase()
				];
				query = mysql.format(query, table);
				pool.getConnection(function (err, connection) {
					if (err) {
						console.log('Error happened :- ', err);
						res.json({
							'Message': 'Error occured',
							'Status': 'Fail'
						});
					} else {
						connection.query(query, function (err, rows) {
							if (err) {
								console.log('Here line 114 Error', err);
							} else {
								sess = req.session;
								sess.email = req.body.adminUserEmail;
								sess.password = req.body.password;
								res.json({
									'Message': 'User updated Successfully',
									'Details': rows[0],
									'Status': 'Success'
								});
							}
						});
					}
					connection.release();
				});
			}
		}
	});
	// 6. Update MovieInfo (Here buy button)
	router.put('/db/admin/update-movie-info', function (req, res) {
		var query = 'UPDATE ?? SET ??=? WHERE ??=?';
		var table = ['admin_movieinfo', 'infoMovieBuyTicketsButton', req.body.buyTicketButtonValue, 'infoImdbID', req.body.movieImdbID];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json({
					'Message': 'Error occured',
					'Status': 'Fail'
				});
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						var query2 = 'UPDATE ?? SET ??=? WHERE ??=?';
						var table2 = ['movieinfo', 'infoMovieBuyTicketsButton', req.body.buyTicketButtonValue, 'infoImdbID', req.body.movieImdbID];
						query2 = mysql.format(query2, table2);
						pool.getConnection(function (err, connection) {
							if (err) {
								console.log('Error happened :- ', err);
								res.json({
									'Message': 'Error occured',
									'Status': 'Fail'
								});
							} else {
								connection.query(query, function (err, rows) {
									if (err) {
										console.log('Here line 114 Error', err);
									} else {
										res.json({
											'Message': 'Movie Info updated Successfully',
											'Status': 'Success'
										});
									}
								});
							}
						});
					}
				});
			}
			connection.release();
		});
	});
	/*Admin Setting :- Movies - Upcoming Movies*/
	// Get quick recommendations
	router.get('/db/admin/recommended-upcoming-movies', function (req, res) {
		/*Searching from Database*/
		// for time being using this..
		var query = 'SELECT * FROM ?? WHERE ??=0 AND `upReleaseDate` BETWEEN (CURDATE()) AND (DATE_SUB( CURDATE() ,INTERVAL -20 DAY))';
		//var query = "SELECT * FROM ?? WHERE ?? LIKE ? AND ";
		var table = ['admin_upcomingmovies', 'upAddByAdmin'];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
						console.log('Success');
					}
				});
			}
			connection.release();
		});
		/*End searching*/
	});
	router.get('/db/admin/added-upcoming-movies', function (req, res) {
		/*Searching from Database*/
		// for time being using this..
		var query = 'SELECT * FROM ?? WHERE ?? BETWEEN ' +
			'((DATE_SUB( CURDATE() ,INTERVAL -1 DAY))) AND (DATE_SUB( CURDATE() ,INTERVAL -30 DAY)) ' +
			'AND ??=1';
		//var query = "SELECT * FROM ?? WHERE ?? LIKE ? AND ";
		var table = ['admin_upcomingmovies', 'upReleaseDate', 'upAddByAdmin'];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
						console.log('Success');
					}
				});
			}
			connection.release();
		});
		/*End searching*/
	});
	// Elastic Search when admin types for a movie name
	router.get('/db/admin/search-upcoming-movies/:movie_name', function (req, res) {
		/*Searching from Database*/
		// for time being using this
		var query = 'SELECT * FROM ?? WHERE ?? LIKE ? AND `upReleaseDate` BETWEEN (CURDATE()) AND (DATE_SUB( CURDATE() ,INTERVAL -20 DAY))';
		//var query = "SELECT * FROM ?? WHERE ?? LIKE ? AND ";
		var table = ['admin_upcomingmovies', 'upMovieName', '%' + req.params.movie_name + '%'];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
						console.log('Success');
					}
				});
			}
			connection.release();
		});
		/*End searching*/
	});
	// Check the movies which are added by the admin.
	router.put('/db/admin/add-upcoming-movies/:movie_id', function (req, res) {
		var query = 'UPDATE ?? SET ?? = ? WHERE ??=?';
		var table = ['admin_upcomingmovies', 'upAddByAdmin', 1, 'upMovieId', req.params.movie_id];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						var query = 'SELECT * FROM ?? WHERE ??=?';
						//var query = "SELECT * FROM ?? WHERE ?? LIKE ? AND ";
						var table = ['admin_upcomingmovies', 'upMovieId', req.params.movie_id];
						query = mysql.format(query, table);
						pool.getConnection(function (err, connection) {
							if (err) {
								console.log('Error happened :- ', err);
								res.json(err);
							} else {
								connection.query(query, function (err, rowws) {
									if (err) {
										console.log('Here line 114 Error', err);
									} else {
										reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/the_movie_db/' + rowws[0].upMovieName)
											.then(function (response) {
												//rottenTomatoesURL.replace("http://www.rottentomatoes.com/m/","")
												reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/rotten_tomatoes/' + rowws[0].upMovieName)
													.then(function (response) {
													});
											});

										reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/copy/upcomingmovies/' + rowws[0].upMovieName)
											.then(function (response) {
												// res.json(response);
											});
									}
								});
							}
							connection.release();
						});
						res.json(rows);
						// console.log("Success");
					}
				});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Current Movies*/
	// GET and UPDATE showtime
	router.get('/db/admin/get-current-movies', function (req, res) {
		/*Searching from Database*/
		// for time being using this
		// var query = "SELECT * FROM ?? WHERE ??=? AND `upReleaseDate` BETWEEN (CURDATE()) AND (DATE_SUB( CURDATE() ,INTERVAL -20 DAY))";
		var query = 'SELECT * FROM ?? WHERE ?? != ?';
		var table = ['admin_movieinfo', 'infoMovieRuntime', 'N/A'];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
						console.log('Success');
					}
				});
			}
			connection.release();
		});
		/*End searching*/
	});
	router.get('/db/admin/get-screen-for-current-movies/:screenType', function (req, res) {
		var query = 'SELECT * FROM ?? WHERE ?? LIKE ?';
		var table = ['admin_setting_screen', 'screenType', '%' + req.params.screenType + '%'];
		query = mysql.format(query, table);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
						console.log('Success');
					}
				});
			}
			connection.release();
		});
	});
	router.get('/db/admin/get-movie-schedule/:movieImdbID?', function (req, res) {
		var query = 'SELECT m_s.*,a_m.* FROM ?? as m_s ' +
			'JOIN  ?? as a_m ON m_s.movieImdbID = a_m.infoImdbID';
		var table = ['movie_schedule', 'admin_movieinfo'];
		if (req.params.movieImdbID) {
			query += ' WHERE m_s.movieImdbID = ?';
			table = ['movie_schedule', 'admin_movieinfo', req.params.movieImdbID]
		}
		query = mysql.format(query, table);
		console.log('Your quer ****', query);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query(query, function (err, rows) {
					if (err) {
						console.log('Here line 114 Error', err);
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});
	router.post('/db/admin/post-movie-schedule', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('INSERT INTO ?? (??,??,??,??,??,??) ' +
					'VALUES (?,?,?,?,?,?) ', ['movie_schedule', 'movieImdbID', 'movieType', 'movieScreen',
						'movieShowDate', 'movieStartTime', 'movieEndTime',
						req.body.movieImdbID, req.body.movieType, req.body.movieScreen, req.body.movieShowDate,
						req.body.movieStartTime, req.body.movieEndTime
					],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/viewer/add-movies/' + req.body.movieImdbID)
								.then(function (response) {
									// res.json(response);
								});
							reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/viewer/add-movie-tomatoes/' + req.body.movieImdbID)
								.then(function (response) {
									// res.json(response);
								});

							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});
	router.delete('/db/admin/delete-movie-schedule', function (req, res) {
		console.log(req.body);
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('DELETE FROM ?? WHERE (??=?) AND (??=?)  AND (??=?)  AND (??=?)  AND (??=?) ', ['movie_schedule', 'movieType', req.body.movieType, 'movieScreen', req.body.movieScreen,
						'movieShowDate', req.body.movieShowDate, 'movieStartTime', req.body.movieStartTime, 'movieEndTime', req.body.movieEndTime
					],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});
	//Update movie schedule info
	router.put('/db/admin/put-movie-schedule', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET  ??=?,??=?,??=?,??=?,??=?,??=?' + ['movie_schedule', 'movieImdbID', req.body.movieImdbID, 'movieType', req.body.movieType,
						'movieScreen', req.body.movieScreen, 'movieShowDate', req.body.movieShowDate,
						'movieStartTime', req.body.movieStartTime, 'movieEndTime', req.body.movieEndTime
					],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							res.json(rows);
							// reqPro('http://'+configJson.localhost+':'+configJson.sitePort+'/api/db/admin/get-movie-schedule')
							//   .then(function (response) {
							//     res.json(response);
							//   });
						}
					});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Site Configuration*/
	// GET and UPDATE site_config
	router.get('/db/admin/setting/site-config', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT * from ?? where ?? = \'userID_1\'', ['admin_site_configuration', 'siteAdminID'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/site-config', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET siteAdminID=?, theatreName=?, theatreURL=?, siteTimeZone=?, day=?, ' +
					'openTime=?, closeTime=? where ?? = ? and day=?', ['admin_site_configuration', req.body.siteAdminID, req.body.theatreName, req.body.theatreURL, req.body.siteTimeZone, req.body.day,
						req.body.openTime, req.body.closeTime, 'site_config_ID', req.body.site_config_ID, req.body.day,
					],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'here line proof of concept An error occured' + err
							});
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Contact Settings*/
	// GET and UPDATE settings/contact-settings
	router.get('/db/admin/setting/contact-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT * FROM ??', ['admin_setting_contact'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occurred' + err
						});
					} else {
						res.json(rows[0]);
					}
				});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/contact-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET contactName=?, contactEmail=?, contactPhone=? WHERE ??=?', ['admin_setting_contact', req.body.contactName, req.body.contactEmail, req.body.contactPhone, 'contactID',
					req.body.contactID
				], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						connection.query('SELECT * FROM ??', ['admin_setting_contact'], function (err, rows) {
							console.log('Something happening');
							if (err) {
								res.json({
									Error: 'here line proof of concept An error occurred' + err
								});
							} else {
								res.json(rows[0]);
							}
						});
					}
				});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Location Settings*/
	// GET and UPDATE settings/location-settings
	router.get('/db/admin/setting/location-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT * FROM ??', ['admin_setting_location'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occurred' + err
						});
					} else {
						res.json(rows[0]);
					}
				});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/location-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET locationTheatreName=?, locationPhysicalAddress=?, locationMailingAddress=? WHERE ??=?', ['admin_setting_location', req.body.locationTheatreName, req.body.locationPhysicalAddress, req.body.locationMailingAddress,
					'locationID', req.body.locationID
				], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						// res.json(rows);
						connection.query('SELECT * FROM ??', ['admin_setting_location'], function (err, rows) {
							console.log('Something happening');
							if (err) {
								res.json({
									Error: 'here line proof of concept An error occurred' + err
								});
							} else {
								res.json(rows[0]);
							}
						});
					}
				});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Social Settings*/
	// GET and UPDATE settings/social-settings
	router.get('/db/admin/setting/social-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT * FROM ??', ['admin_setting_social'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occurred' + err
						});
					} else {
						res.json(rows[0]);
					}
				});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/social-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET socialFacebook=?, socialTwitter=? WHERE ??=?', ['admin_setting_social', req.body.socialFacebook, req.body.socialTwitter, 'socialID', req.body.socialID], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						connection.query('SELECT * FROM ??', ['admin_setting_social'], function (err, rows) {
							console.log('Something happening');
							if (err) {
								res.json({
									Error: 'here line proof of concept An error occurred' + err
								});
							} else {
								res.json(rows[0]);
							}
						});
						// res.json(rows);
					}
				});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Screen Settings*/
	// POST, GET and UPDATE settings/screen-settings
	router.post('/db/admin/setting/screen-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('INSERT INTO ?? (??, ??, ??) ' +
					'VALUES (?, ?, ?)', ['admin_setting_screen', 'screenName', 'screenType', 'noOfSeats',
						req.body.screenName, req.body.screenType, req.body.noOfSeats
					],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'here line proof of concept An error occurred' + err
							});
						} else {
							connection.query('SELECT * FROM ??', ['admin_setting_screen'], function (err, rows) {
								console.log('Something happening');
								if (err) {
									res.json({
										Error: 'here line proof of concept An error occurred' + err
									});
								} else {
									res.json(rows);
								}
							});
							// res.json(rows);
						}
					});
			}
			connection.release();
		});
	});
	router.get('/db/admin/setting/screen-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT * FROM ??', ['admin_setting_screen'], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occurred' + err
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/screen-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET screenName=?, screenType=?, noOfSeats=? where ??=?', ['admin_setting_screen', req.body.screenName, req.body.screenType, req.body.noOfSeats, 'screenName', req.body.screenName], function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'here line proof of concept An error occured' + err
						});
					} else {
						connection.query('SELECT * FROM ??', ['admin_setting_screen'], function (err, rows) {
							console.log('Something happening');
							if (err) {
								res.json({
									Error: 'here line proof of concept An error occurred' + err
								});
							} else {
								res.json(rows);
							}
						});
						// res.json(rows);
					}
				});
			}
			connection.release();
		});
	});

	/*Admin Setting :- Ticket Settings*/
	// GET and UPDATE settings/ticket-settings
	router.get('/db/admin/setting/ticket-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('SELECT  a.*  FROM ?? a JOIN ?? b ' +
					'ON a.ticketType = b.ticketType ' +
					'WHERE a.ticketDay=b.ticketDay ' +
					'GROUP BY a.ticketID', ['admin_setting_ticket', 'admin_setting_ticket'],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'here line proof of concept An error occurred' + err
							});
						} else {
							var structAppend = [];
							for (var i = 0; i <= rows.length - 5; i++) {
								var struct = {
									day: rows[i].ticketDay,
									ticketDetails: [{
										ticketGroup: rows[i].ticketGroup,
										ticketName: rows[i].ticketName,
										ticketPrice2D: rows[i].ticketPrice,
										ticketPrice3D: rows[++i].ticketPrice
									},
										{
											ticketGroup: rows[++i].ticketGroup,
											ticketName: rows[i].ticketName,
											ticketPrice2D: rows[i].ticketPrice,
											ticketPrice3D: rows[++i].ticketPrice
										},
										{
											ticketGroup: rows[++i].ticketGroup,
											ticketName: rows[i].ticketName,
											ticketPrice2D: rows[i].ticketPrice,
											ticketPrice3D: rows[++i].ticketPrice
										}
									]
								};
								structAppend.push(struct);
							}
							// res.json(rows);
							res.json(structAppend);
						}
					});
			}
			connection.release();
		});
	});
	router.put('/db/admin/setting/ticket-setting', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('UPDATE ?? SET ticketName=?, ticketType=?, ticketPrice=?, ticketGroup=?, ticketDay=? ' +
					'where ??=? AND ??=? AND ??=?', ['admin_setting_ticket', req.body.ticketName, req.body.ticketType, req.body.ticketPrice, req.body.ticketGroup,
						req.body.ticketDay, 'ticketGroup', req.body.ticketGroup, 'ticketType', req.body.ticketType, 'ticketDay', req.body.ticketDay
					],
					function (err, rows) {
						console.log('Something happening');
						if (err) {
							res.json({
								Error: 'here line proof of concept An error occured' + err
							});
						} else {
							// res.json(rows);
							connection.query('SELECT  a.*  FROM ?? a JOIN ?? b ' +
								'ON a.ticketType = b.ticketType ' +
								'WHERE a.ticketDay=b.ticketDay ' +
								'GROUP BY a.ticketID', ['admin_setting_ticket', 'admin_setting_ticket'],
								function (err, rows) {
									console.log('Something happening');
									if (err) {
										res.json({
											Error: 'here line proof of concept An error occurred' + err
										});
									} else {
										var structAppend = [];
										for (var i = 0; i <= rows.length - 5; i++) {
											var struct = {
												day: rows[i].ticketDay,
												ticketDetails: [{
													ticketGroup: rows[i].ticketGroup,
													ticketName: rows[i].ticketName,
													ticketPrice2D: rows[i].ticketPrice,
													ticketPrice3D: rows[++i].ticketPrice
												},
													{
														ticketGroup: rows[++i].ticketGroup,
														ticketName: rows[i].ticketName,
														ticketPrice2D: rows[i].ticketPrice,
														ticketPrice3D: rows[++i].ticketPrice
													},
													{
														ticketGroup: rows[++i].ticketGroup,
														ticketName: rows[i].ticketName,
														ticketPrice2D: rows[i].ticketPrice,
														ticketPrice3D: rows[++i].ticketPrice
													}
												]
											};
											structAppend.push(struct);
										}
										// res.json(rows);
										res.json(structAppend);
									}
								});
						}
					});
			}
			connection.release();
		});
	});

	/****************************End Admin Panel**********************************/


	/*Insert into customer view */
	router.get('/db/viewer/add-movies/:infoImdbID', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('INSERT INTO ?? (SELECT * FROM ?? WHERE ??=?)', ['movieinfo', 'admin_movieinfo', 'infoImdbID', req.params.infoImdbID],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});

	router.get('/db/viewer/add-movie-tomatoes/:infoImdbID', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				connection.query('INSERT INTO ?? (SELECT * FROM ?? WHERE ??=?)', ['movietomatoes', 'admin_movietomatoes', 'mtImdbID', req.params.infoImdbID],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});

	router.get('/db/copy/upcomingmovies/:upMovieName', function (req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
			} else {
				// connection.query("INSERT INTO ??  (`upMovieId`,`upMovieName`,`upReleaseDate`,`upPosterPath`,`upDuration`) SELECT DISTINCT a.`upMovieId`,a.`upMovieName`,a.`upReleaseDate`,a.`upPosterPath`," +
				//   "a.`upDuration` FROM ?? a LEFT JOIN ?? u ON u.`upMovieId`!=a.`upMovieId` WHERE a.`upMovieId` NOT IN (SELECT `upMovieId` FROM ??) AND a.`upAddByAdmin`=1",
				//   ["upcomingmovies","admin_upcomingmovies","upcomingmovies","upcomingmovies"],
				// ["upcomingmovies","admin_upcomingmovies","upcomingmovies","upcomingmovies"],
				connection.query('INSERT INTO ??  (`upMovieId`,`upMovieName`,`upReleaseDate`,`upPosterPath`,`upDuration`) ' +
					'SELECT DISTINCT a.`upMovieId`,a.`upMovieName`,a.`upReleaseDate`,a.`upPosterPath`,' +
					'a.`upDuration` FROM ?? a WHERE a.`upMovieName`=? AND a.`upAddByAdmin`=1', ['upcomingmovies', 'admin_upcomingmovies', req.params.upMovieName],
					function (err, rows) {
						if (err) {
							console.log('Here line 114 Error', err);
						} else {
							res.json(rows);
						}
					});
			}
			connection.release();
		});
	});
	/*Movie Comments*/
	router.get('/db/getComments/:imdbID', function (req, res) {
		var imdbID = req.params.imdbID;
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				var q_query = 'SELECT DISTINCT mu.movieUserFirstName, mu.movieUserLastName, mu.movieUserFBProfileImage, ' +
					'mc.m_c_comment, mc.m_c_star_rating, mc.m_c_current_time ' +
					'FROM movie_theatre.movieuser AS mu ' +
					'INNER JOIN  movie_theatre.movie_comments as mc ' +
					'ON mc.m_c_user_fb_email = mu.movieUserEmailId ' +
					'WHERE mc.m_c_movie_imdb_id = ?' +
					'ORDER BY mc.m_c_current_time desc';
				var t_table = [imdbID];
				q_query = mysql.format(q_query, t_table);
				connection.query(q_query, function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'Get Comments error:- ' + err
						});
					} else {
						res.json(rows);
					}
				});
			}
			connection.release();
		});
	});
	//Pending
	router.post('/db/addComment/:imdbID/:fb_mail', function (req, res) {
		var imdbID = req.params.imdbID;
		var fb_mail = req.params.fb_mail;
		pool.getConnection(function (err, connection) {
			if (err) {
				console.log('Error happened :- ', err);
				res.json(err);
				//self.connectMysql();
			} else {
				var query = 'INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)';
				var table = ['movie_comments', 'm_c_movie_imdb_id', 'm_c_user_fb_email',
					'm_c_comment', 'm_c_star_rating', 'm_c_current_time',
					imdbID, fb_mail, req.body.user_comments, req.body.star_rating, req.body.current_time
				];
				query = mysql.format(query, table);
				connection.query(query, function (err, rows) {
					console.log('Something happening');
					if (err) {
						res.json({
							Error: 'Get Comments error:- ' + err
						});
					} else {
						var q_query = 'SELECT DISTINCT mu.movieUserFirstName, mu.movieUserLastName, mu.movieUserFBProfileImage, ' +
							'mc.m_c_comment, mc.m_c_star_rating, mc.m_c_current_time ' +
							'FROM movie_theatre.movieuser AS mu ' +
							'INNER JOIN  movie_theatre.movie_comments as mc ' +
							'ON mc.m_c_user_fb_email = mu.movieUserEmailId ' +
							'WHERE mc.m_c_movie_imdb_id = ?' +
							'ORDER BY mc.m_c_current_time desc';
						var t_table = [imdbID];
						q_query = mysql.format(q_query, t_table);
						connection.query(q_query, function (err, rows) {
							console.log('Something happening');
							if (err) {
								res.json({
									Error: 'Get Comments error:- ' + err
								});
							} else {
								res.json(rows);
							}
						});
					}
				});
			}
			connection.release();
		});
	});
	/*End Movie Comments*/

};

module.exports = REST_ROUTER;
