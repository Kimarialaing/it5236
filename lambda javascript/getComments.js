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
	
		//validator.validateCommentUserID(event.commentuserid, errors);

	

	
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
	 var sql = "SELECT commentid, commenttext, convert_tz(comments.commentposted,@@session.time_zone,'America/New_York') as commentposted, username, attachmentid, filename " +
                "FROM comments LEFT JOIN users ON comments.commentuserid = users.userid " +
                "LEFT JOIN attachments ON comments.commentattachmentid = attachments.attachmentid " +
                "WHERE commentthingid = ? ORDER BY commentposted ASC";
                
		conn.query(sql, [event.commentthingid], function (err, result) {
		  	if (err) {
				// This should be a "Internal Server Error" error
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		  	} else {
		  			var jsons= [];
		  		for(var i=0; i<result.length; i++)
		  		
		  		jsons[i] = {
		  		commentid : result[i].commentid,
		  		commenttext : result[i].commenttext,
		  		dateposted : result[i].commentposted,
		  		username : result[i].username,
		  		attachmentid : result[i].attachmentid,
		  		filename : result[i].filename
		  		}
		  	}
		  		
		  		
		  		// Pull out just the codes from the "result" array (index '1')
				  	/*	var codes = [];
				  		for(var i=0; i<result.length; i++) {
				  			codes.push(result[i]['commentid']);
							codes.push(result[i]['commenttext']);
							codes.push(result[i]['commentposted']);
							codes.push(result[i]['commentuserid']);
							codes.push(result[i]['commentthingid']);
							codes.push(result[i]['commentattachmentid']);
					
						}
		  	*/
		  	var json = { 
							commentid : event.commentthingid,
							comment : jsons
						};
						
		  	//	console.log("Session");
		  		callback(null, json );
		  		setTimeout(function(){ conn.end(); }, 3000);

		  	
		  	}); //query registration codes
		}); //connect database
	} //no validation errors
}; //handler



