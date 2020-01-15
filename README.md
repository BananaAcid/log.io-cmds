# log.io-cmds
Helper tools to cennect to log.io server (logio.org) (osx, win, linux, ..)

## install
```
> npm i log.io-cmds -g
```
or cutting edge: 
```
> npm i BananaAcid/log.io-cmds#master -g
```

## usage (log.io v0.4.3+)
```
> msg2logio -m "test message"
> msg2logiobare "+msg|streamName1|sourceName1|this is a log message"
```

### note
- If you prefer the Windows style, you may use `/param` or `/param=val`
- the "bare" variant is only connecting to localhost - use it as a simple code example

## help
```
> msg2logio --help

Talk to Log.io Server (this is a "3rd party Harvester")
Author: Nabil Redmann 2020, www.nabil-redmann.de
docu: https://github.com/NarrativeScience/Log.io

CONFIGURATION:
        edit this file and change this part: var conConfig = { port: '6689', host: 'localhost' } ;
        or add those keys as params: --host=localhost --port=28777

        to show configuration and params use: --showconfig

USAGE SHORT: msg2logio -m "message to send" "second message to send" ...
             msg2logio --msg "message to send" "second message to send" ...
             msg2logio --msg=warn "message to send" "second message to send" ...
         OR: echo "message to send \n second message to send \n ..." | msg2logio --msg
             cat some.log | tail -5 | msg2logio --msg=info --service="status Update"

USAGE: msg2logio "+msg|service|server|info|message to send" "+msg|service|server|info|second message to send" ...

        Send a log message (if none, registers a new node and stream but does not deliver msg) - "info" can be any keyword or emoji ✔ ❌ ❤ ✨
        +msg|my_stream|my_node|info|this is log message

        Register a new node
        +input|my_node

        Register a new node, with stream associations
        +input|my_node|my_stream1,my_stream2

        Remove a node
        -input|my_node

        this will send as (msg, username, hostname, info-flag, message):
        [
                "+msg|webservice|Server01|info|message to send",
                "+msg|webservice|Server01|info|second message to send",
                ...
        ]
```

## usage (log.io v0.3.4-)
```
> msg2logio.0.3 --log "test message"
> msg2logiobare.0.3 "+log|streamName1|sourceName1|this is a log message"
```
