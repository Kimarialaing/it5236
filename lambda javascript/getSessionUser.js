var mysql = require('./node_modules/mysql');
var config = require('./config.json');
var validator = require('./validation.js');

function formatErrorResponse(code, errs) {
	return JSON.stringify({ 
		error  : code,
		errors : errs
	});
}

exports.handler = (event, context, callback) => {

	//validate input
	var errors = new Array();
	
		//validator.validateUserID(event.userid, errors);

	

	
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
		}
		console.log("Connected!");
		var sql = "SELECT userid, registrationcode FROM usersessions WHERE usersessionid = ? "
			"VALUES (?)";
		
		conn.query(sql, [event.usersessionid], function (err, result) {
		  	if (err) {
				// This should be a "Internal Server Error" error
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		  	} else {
		  		// Pull out just the codes from the "result" array (index '1')
				  		var codes = [];
				  		for(var i=0; i<result.length; i++) {
							codes.push(result[i]['usersessionid']);
						}
		  	
		  	var json = { 
							userid : event.userid,
							usersessions : codes
						};
						
		  	//	console.log("Session");
		  		callback(null, json );
		  		setTimeout(function(){ conn.end(); }, 3000);

		  	}
		  	}); //query registration codes
		}); //connect database
	} //no validation errors
}; //handler



