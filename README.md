# cassbot

#### Install guide

Modify _cassbot.json_ with your configuration details and then:

    npm install -g pm2
    npm install
    pm2 start cassbot.json

If you don't want to run pm2 you can manually set your environment variables and just run _node cassbot.js_ but I recommend pm2. 

#### Current Commands

- 'run ring'
- 'run compactionstats'
- 'run netstats'
- 'run gossipinfo'
- 'run tail'

#### Additional parameters:

- 'node {number}'

#### Examples:

- '@cassbot run netstats on node 12'
- '@cassbot run ring on node 1'
