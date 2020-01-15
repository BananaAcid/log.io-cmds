#!/usr/bin/env node
/*
	Nabil Redmann 2013
	
	www.nabil-redmann.de


	docu: https://github.com/NarrativeScience/log.io/tree/v0.3.4/
	code: https://github.com/NarrativeScience/log.io/tree/v0.3.4/src/harvester.coffee
*/

// target server config
var conConfig = {port: '28777', host: 'localhost'};


// params, preset ---   defaults log=info, echo=log [all console.*() can be]
var config = {port: conConfig.port, host: conConfig.host, log: false, logdefaultvalue: 'info', echo: false, echocleanednl: true, service: process.env.USER, server: require('os').hostname(), verbose: false, showconfig: false, help: false};

// mix shell params
var argsMsgs = proccessArgs(); // get shell params
conConfig = {port: config.port, host: config.host}; // write server info back to the server connection config
config.log = (config.log==true) ? config.logdefaultvalue : config.log; // if its TRUE, set it to 'info', otherwise use eiter a settetd keyword or its default disabled state
config.echo = (config.echo==true) ? 'log' : config.echo;

// constants
var NOPARAMS = (process.argv.length <= 2)
  , ISTTY = process.stdin.isTTY;


 
// show config
if (config.showconfig) {
	console.log('Configuration (are also params, use --param=value):', '\n', config);
	return;
}

// show help:
if (config.help)
{
	console.error('\nTalk to Log.io Server (this is a "3rd party Harvester")\n\
Author: Nabil Redmann 2013, www.nabil-redmann.de \n\
docu: https://github.com/NarrativeScience/Log.io \n\
	\n\
CONFIGURATION: \n\
	edit this file and change this part: var conConfig =',conConfig,'; \n\
	or add those keys as params: --host=localhost --port=28777 \n\
	\n\
	to show configuration and params use: --showconfig \n\
	\n\
USAGE: ' + require('path').basename(process.argv[1]) + ' "+log|service|server|info|message to send" "+log|service|server|info|second message to send" ... \n\
	\n\
	Send a log message (if none, registers a new node and stream but does not deliver msg) - "info" can be any keyword \n\
	+log|my_stream|my_node|info|this is log message \n\
	\n\
	Register a new node \n\
	+node|my_node \n\
	\n\
	Register a new node, with stream associations \n\
	+node|my_node|my_stream1,my_stream2 \n\
	\n\
	Remove a node \n\
	-node|my_node \n\
	\n\
USAGE SHORT: ' + require('path').basename(process.argv[1]) + ' --log "message to send" "second message to send" ... \n\
             ' + require('path').basename(process.argv[1]) + ' --log=warn "message to send" "second message to send" ... \n\
         OR: echo "message to send \\n second message to send \\n ..." | ' + require('path').basename(process.argv[1]) + ' --log \n\
             cat some.log | tail -5 | ' + require('path').basename(process.argv[1]) + ' --log=info --service="status Update" \n\
	\n\
	this will send as (log, username, hostname, info-flag, message): \n\
	[ \n\
		"+log|' + config.service + '|' + config.server + '|' + config.logdefaultvalue + '|message to send", \n\
		"+log|' + config.service + '|' + config.server + '|' + config.logdefaultvalue + '|second message to send", \n\
		... \n\
	] \n\
	');
	
	return;
}




// Help hint --- this is where no other param has taken over
if ((NOPARAMS || !argsMsgs.length) && ISTTY) {
	console.log('to show info use: ' + require('path').basename(process.argv[1]) + ' --help');
	return;
}


// Do the heavy lifting
{
	var messages = '';
	
	// command line messages must be joined
	if (ISTTY)
	  messages = argsMsgs.join('\r\n');
	

	// establish a connection to the main server
	config.verbose && console.log('connecting to:', conConfig);
	var client = require('net').connect(conConfig,
	 function() { // open connection
	  config.verbose && console.log('... connected');
	  
	  function writeMsg() {
		var messagesUnmodified = messages;
		
	    // fix any kind of newline, either \\n \n \\r \r 
	    messages = messages.trim().replace(/((\\[rn])+|[\r\n]+)/g, '\r\n');

		var messagesCleaned = messages;
		
		// --log=info param for anyone: prepend log command
		if (config.log)
			messages = messages.replace(/(^|\r\n)/g, '$1+log|' + config.service + '|' + config.server + '|' + config.log + '|');

		// show feedback
		if (config.verbose)
			console.log('writeing:\n' + messages);

		// echo to STDOUT or STDERR ('log' or 'error')
		if (config.echo)
			console[config.echo](config.echocleanednl ? messagesCleaned : messagesUnmodified);
			
		// send messages to main server
		client.write(messages + '\r\n'); 
		
		// close connection to return to shell
		client.end();
	  }
	  
	  // using parameters ...
	  if (ISTTY) {
		  // directly send msg
		  writeMsg();
	  }
	  //wait, for piped data do be streamed
	  else
	  {
		  // collect piped data
		  process.stdin.on('data', function(chunk) { messages += chunk; });
		  // on end: send
		  process.stdin.on('end', writeMsg);
	  }
	});

	
	// for convenience ... 
	
	client.on('data', function(data) {
		console.log('data:', data.toString());
		client.end();
	});

	client.on('error', console.error);

	client.on('end', function() {
		if (config.verbose)
			console.log('.. disconnected');
	});
}

// my param handler
function proccessArgs() {
	if (NOPARAMS)
		return;
	
	msgs = [];

	// remove path [0] and binary and scriptname [1]
	for (var i = 2; i < process.argv.length; i++) {
		var item = process.argv[i];
		
		if (~item.indexOf('--')) {
			
			// requires xy part to exist => or ret is null
			// "--xy=123" -> ["--xy=123", "xy", "123"]
			// "--xy123"  -> ["--xy123", "xy123", ""]
			var parts = item.match(/--([^=$]+)=*([^$]*)/);
			
			if (parts)
				config[parts[1]] = (parts[2] || true);
		}
		else
			msgs.push(item);
	}
	
	return msgs;
}