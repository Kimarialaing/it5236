var mysql = require('./node_modules/mysql');
var config = require('./include/config.json');
var validator = require('./include/validation.js');

function formatErrorResponse(code, errs) {
	return JSON.stringify({ 
		error  : code,
		errors : errs
	});
}

exports.handler = (event, context, callback) => {
	//instruct the function to return as soon as the callback is invoked
	context.callbackWaitsForEmptyEventLoop = false;

	//validate input
	var errors = new Array();
	
	if(errors.length > 0) {
		// This should be a "Bad Request" error
		callback(formatErrorResponse('BAD_REQUEST', errors));
	} else {
	
	//getConnection equivalent
	var conn = mysql.createConnection({
		host 	: config.dbhost,
		user 	: config.dbuser,
		password : config.dbpassword,
		database : config.dbname
	});
	
	//prevent timeout from waiting event loop
	context.callbackWaitsForEmptyEventLoop = false;

	//attempts to connect to the database
	conn.connect(function(err) {
	  	
		if (err)  {
			// This should be a "Internal Server Error" error
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		} else {
			console.log("Connected!");
			var sql = "SELECT userid FROM emailvalidation WHERE emailvalidationid = ?";
			
			conn.query(sql, [event.emailvalidationi], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
			  	} else {
						var sql = "DELETE FROM emailvalidation WHERE emailvalidationid = ?";
						//START TO DIFFER
						//POST 	
					
						conn.query(sql, [event.emailvalidationid, event.userid, event.email], function (err, result) {
							if (err) {
								// Check for duplicate values
								if(err.errno == 1062) {
									console.log(err.sqlMessage);
									if(err.sqlMessage.indexOf('username') != -1) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Duplicate value"]));
									}
								} else {
									// This should be a "Internal Server Error" error
									callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
								}
				      		} else {
					      		var sql = "UPDATE users SET emailvalidated = 1 WHERE userid = ?";
								conn.query(sql, [event.userid, event.emailvalidationid], function (err, result) {
									if (err) {
						        		callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
						      		} else {
							        	console.log("successful process of email validation");
						      			callback(null,"email validation process successful");
						      			setTimeout(function(){conn.end();},3000);
					      			}
			      				}); //query userregistrations
				      		} //error users
			    			}); //query users
			  			} //good registration
					}); //good code count
			  	} //query registration codes
			});
	} //connect database
}; // no connection errors