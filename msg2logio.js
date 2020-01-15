#!/usr/bin/env node
/*
	Nabil Redmann 2020
	
	www.nabil-redmann.de


	docu: https://github.com/NarrativeScience/log.io/tree/v0.4.3/
*/

// target server config
var conConfig = {port: 6689, host: 'localhost'};


// params, preset ---   defaults msg=info, echo=msg [all console.*() can be]
var config = {port: conConfig.port, host: conConfig.host, msg: false, logdefaultvalue: 'info', echo: false, echocleanednl: true, service: process.env.USER || process.env.USERNAME, server: require('os').hostname(), verbose: false, showconfig: false, help: false};

// mix shell params
var argsMsgs = proccessArgs(); // get shell params
conConfig = {port: config.port, host: config.host}; // write server info back to the server connection config
config.msg = config.m || config.msg;  // allow short param
config.msg = (config.msg==true) ? config.logdefaultvalue : config.msg; // if its TRUE, set it to 'info', otherwise use eiter a settetd keyword or its default disabled state
config.echo = (config.echo==true) ? 'log' : config.echo;
config.help = config.h || config.help;

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
Author: Nabil Redmann 2020, www.nabil-redmann.de \n\
docu: https://github.com/NarrativeScience/Log.io \n\
	\n\
CONFIGURATION: \n\
	edit this file and change this part: var conConfig =',conConfig,'; \n\
	or add those keys as params: --host=localhost --port=28777 \n\
	\n\
	to show configuration and params use: --showconfig \n\
	\n\
USAGE SHORT: ' + require('path').basename(process.argv[1]) + ' -m "message to send" "second message to send" ... \n\
             ' + require('path').basename(process.argv[1]) + ' --msg "message to send" "second message to send" ... \n\
             ' + require('path').basename(process.argv[1]) + ' --msg=warn "message to send" "second message to send" ... \n\
         OR: echo "message to send \\n second message to send \\n ..." | ' + require('path').basename(process.argv[1]) + ' --msg \n\
             cat some.log | tail -5 | ' + require('path').basename(process.argv[1]) + ' --msg=info --service="status Update" \n\
	\n\
USAGE: ' + require('path').basename(process.argv[1]) + ' "+msg|service|server|info|message to send" "+msg|service|server|info|second message to send" ... \n\
	\n\
	Send a log message (if none, registers a new source and stream but does not deliver msg) - "info" can be any keyword or emoji ✔ ❌ ❤ ✨ \n\
	+msg|streamName|sourceName|info|this is log message \n\
	\n\
	Register a new source \n\
	+input|sourceName \n\
	\n\
	Register a new stream \n\
	+input|sourceName|streamName1 \n\
	\n\
	Remove a source \n\
	-input|sourceName \n\
	\n\
	Remove a stream \n\
	-input|sourceName|streamName1 \n\
	\n\
	this will send as (msg, username, hostname, info-flag, message): \n\
	[ \n\
		"+msg|' + config.service + '|' + config.server + '|' + config.logdefaultvalue + '|message to send", \n\
		"+msg|' + config.service + '|' + config.server + '|' + config.logdefaultvalue + '|second message to send", \n\
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
	  messages = argsMsgs.join('\0');
	

	// establish a connection to the main server
	config.verbose && console.log('connecting to:', conConfig);
	var client = require('net').connect(conConfig,
	 function() { // open connection
	  config.verbose && console.log('... connected');
	  
	  function writeMsg() {
		var messagesUnmodified = messages;
		
	    // fix any kind of newline, either \\n \n \\r \r 
	    messages = messages.trim().replace(/((\\[rn])+|[\r\n]+)/g, '\0');

		var messagesCleaned = messages;
		
		// --msg=info param for anyone: prepend msg command
		if (config.msg)
			messages = messages.replace(/(^|\0)/g, '$1+msg|' + config.service + '|' + config.server + '|' + config.msg + '|');

		// show feedback
		if (config.verbose)
			console.log('writeing:\n' + messages.replace(/\0/, '\n'));

		// echo to STDOUT or STDERR ('log' or 'error')
		if (config.echo)
			console[config.echo](config.echocleanednl ? messagesCleaned : messagesUnmodified);
			
		// send messages to main server
		client.write(messages + '\0'); 
		
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
		
		if (~item.indexOf('--') || ~item.indexOf('-') || ~item.indexOf('\/')) {
			
			// requires xy part to exist => or ret is null
			// "--xy=123" -> config.xy = "123"
			// "--xy123"  -> config.xy123 = true
			// "-xy=123" -> config.xy = "123"
			// "-xy123"  -> config.xy123 = true
			// "/xy=123" -> config.xy = "123"
			// "/xy123"  -> config.xy123 = true
			var parts = item.match(/(\/|-+)([^=$]+)=*([^$]*)/);
			
			if (parts)
				config[parts[2]] = (parts[3] || true);
		}
		else
			msgs.push(item);
	}
	
	return msgs;
}