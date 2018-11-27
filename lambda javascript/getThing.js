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
	
//	validator.validateUserID(event.thingid, errors);

	

	
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
 var sql = "SELECT things.thingid, things.thingname, convert_tz(things.thingcreated,@@session.time_zone,'America/New_York') as thingcreated, things.thinguserid, things.thingattachmentid, things.thingregistrationcode, username, filename " +
                "FROM things LEFT JOIN users ON things.thinguserid = users.userid " +
                "LEFT JOIN attachments ON things.thingattachmentid = attachments.attachmentid " +
                "WHERE thingid = ?";
		
		conn.query(sql, [event.thingid], function (err, result) {
		  	if (err) {
				// This should be a "Internal Server Error" error
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		  	} else {
		  		var jsons= [];
		  		for(var i=0; i<result.length; i++)
		  		
		  		jsons[i] = {
		  		thingid : result[i].thingid,
		  		thingname : result[i].thingname,
		  		date : result[i].thingcreated,
		  		userid : result[i].thinguserid,
		  		attachmentid : result[i].thingattachmentid,
		  		registrationcode : result[i].thingregistrationcode
		  			
		  		}
		  	}
		  		// Pull out just the codes from the "result" array (index '1')
		  		
		  		if(!event.thingid){
		  			callback('BAD_REQUEST', "Thing does not exist")
		  		}
				  	/*	var codes = [];
				  		for(var i=0; i<result.length; i++) {
				  			codes.push(result[i]['thingid']);
							codes.push(result[i]['thingname']);
							codes.push(result[i]['thingcreated']);
							codes.push(result[i]['thinguserid']);
							codes.push(result[i]['thingattachmentid']);
							codes.push(result[i]['thingregistrationcode']);


						}
	*/	  	
		  	var json = { 
							thingid : event.thingid,
							thing : jsons
						};
						
		  	//	console.log("Session");
		  		callback(null, json );
		  		setTimeout(function(){ conn.end(); }, 3000);

		  	
		  	}); //query registration codes
		}); //connect database
	} //no validation errors
}; //handler




