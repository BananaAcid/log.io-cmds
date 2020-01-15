#!/usr/bin/env node
/*
	Nabil Redmann 2013
	
	www.nabil-redmann.de


	docu: https://github.com/NarrativeScience/log.io/tree/v0.3.4/
	code: https://github.com/NarrativeScience/log.io/tree/v0.3.4/src/harvester.coffee
*/

// target server config
var conConfig = {port: '28777', host: 'localhost'};

// constants
var NOPARAMS = (process.argv.length <= 2);

// show help:
if (NOPARAMS) {
	console.error('\nTalk to Log.io Server (this is a "3rd party Harvester") \n\
Author: Nabil Redmann 2013, www.nabil-redmann.de \n\
docu: https://github.com/NarrativeScience/Log.io (for commands) \n\n\
usage: ' + require('path').basename(process.argv[1]) + ' "+log|service|server|info|message to send" ... \n\
	');
}
else
{// Do the heavy lifting

	// establish a connection to the main server
	var client = require('net').connect(conConfig,
		function() { // open connection

			// command line messages must be joined
			// fix any kind of newline, either \\n \n \\r \r 
			var messages = process.argv.splice(2).join('\r\n');
				
			// send messages to main server
			client.write(messages + '\r\n'); 
			
			// close connection to return to shell
			client.end();
		});
	
	client.on('error', console.error);
}