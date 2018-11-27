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
	
	 // Validate the user input
	validator.validateUsername(event.username, errors);
	validator.validateEmail(event.email, errors);
	
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
//POST 				
		if (err) {
			// This should be a "Internal Server Error" error
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		}else{   
		
		console.log("Connected!");
		var sql = "UPDATE users SET username=?, email= ?, isadmin = ?, passwordhash= ? WHERE userid = ?";
		
		conn.query(sql, [event.username, event.email, event.isadmin, event.passwordhash, event.userid], function (err, result) {
			if (err) {
				// Check for duplicate values
				if(err.errno == 1062) {
					console.log(err.sqlMessage);
					if(err.sqlMessage.indexOf('username') != -1) {
						// This should be a "Internal Server Error" error
						callback(formatErrorResponse('BAD_REQUEST', ["Username already exists"]));
					} else if(err.sqlMessage.indexOf('email') != -1) {
						// This should be a "Internal Server Error" error
						callback(formatErrorResponse('BAD_REQUEST', ["Email address already registered"]));
					}
				} else {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
				}
      		} else {
	        	console.log("successfully updated user info");
      			callback(null,"updated user info successfully");
      			setTimeout(function(){conn.end();},3000);
  				}
  		}); //query userregistrations
	} //query users
	});
	}
 }//good registration