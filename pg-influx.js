#!/usr/bin/env node


var pg = require('pg');

var conString = "postgres://mike:test@192.168.3.22/couchplay";

	
pgclient = new pg.Client(conString);
	
pgclient.connect(function(err) {
	    if (err) {
	        console.error('ERROR: Could not connect to postgres', err);
	        process.exit();
	    } else {
	        console.log('Connected to postgres');
	    }
});



var http = require("http");
var url = require("url") ;
var control_port = 8086;


function onRequest(request, response) {

	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', '*');
	if ( request.method === 'OPTIONS' ) {
		response.writeHead(200);
		response.end();
		return;
	}

    response.writeHead(200, {
        "Content-Type": "text/plain"
    });

    console.log(request.url);

    var queryObject = url.parse(request.url,true);
//    console.log(queryObject);


    switch (queryObject.pathname) {
        case '/query':

//            response.write("Pretend to be influx\n");            
//            response.write("SQL: " + queryObject.query.q + "\n"); 

            console.log(queryObject.query.q);

            pgclient.query(queryObject.query.q, function(err, result) {
    	        if (err) {
	            console.error('ERROR: ', err);
                }else{
                    response.write( String(result.rows[0].ret) );	    
//	            console.error('ret: ', result.rows[0].ret);
		}
                response.end();

            });
            break;
        default:            
            response.write("OK\n");
            response.write(request.url);
	    response.end();
    }
}

http.createServer(onRequest).listen(control_port);
console.log('Listening on port ' + control_port);
