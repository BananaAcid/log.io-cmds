# log.io-cmds
Helper tools to cennect to log.io server (logio.org)

## install
```
> npm i BananaAcid/log.io-cmds#master -g
```

## usage
```
> msg2logio -m "test message"
> msg2logiobare "+msg|streamName1|sourceName1|this is log message"
```

## help
```
> msg2logio --help


Talk to Log.io Server (this is a "3rd party Harvester")
Author: Nabil Redmann 2013, www.nabil-redmann.de
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
                "+msg|nabil|BananaAcidX|info|message to send",
                "+msg|nabil|BananaAcidX|info|second message to send",
                ...
        ]
```