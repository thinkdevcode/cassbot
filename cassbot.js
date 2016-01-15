/*
  Cassbot

  Current commands:
    - 'run ring'
    - 'run compactionstats'
    - 'run netstats'
    - 'run gossipinfo'
    - 'run tail'

  Additional parameters:
    - 'node {number}'

  Examples:
    - '@cassbot run netstats on node 12'
    - '@cassbot run ring on node 1'
*/

var botkit = require('botkit'),
    exec = require('ssh-exec'),
    fs = require('fs'),
    cassbot = botkit.slackbot({ debug: process.env.DEBUG }),
    bot = cassbot.spawn({ token: process.env.TOKEN })
                 .startRTM();

var nodes = JSON.parse(process.env.NODES);
nodes.unshift(''); // nodes start at 1

var commands = [
  {command: '(?:run.*tail)',            response: buildCmdResponse(`tail ${process.env.LOG_PATH} -n 20`)},
  {command: '(?:run.*ring)',            response: buildCmdResponse(`${process.env.NODETOOL_PATH} ring`)},
  {command: '(?:run.*compactionstats)', response: buildCmdResponse(`${process.env.NODETOOL_PATH} compactionstats`)},
  {command: '(?:run.*netstats)',        response: buildCmdResponse(`${process.env.NODETOOL_PATH} netstats`)},
  {command: '(?:run.*gossipinfo)',      response: buildCmdResponse(`${process.env.NODETOOL_PATH} gossipinfo`)}
];

commands.forEach((cmd) => {
  cassbot.hears(cmd.command, 'direct_message,direct_mention,mention', cmd.response);
});

function buildCmdResponse(command) {
  return (bot, message) => {
    var nodeNum = parseInt(message.text.match(/node (.*)/i)[1]),
        reactionUp = {
            timestamp: message.ts,
            channel: message.channel,
            name: 'thumbsup'
        },
        reactionDown = {
            timestamp: message.ts,
            channel: message.channel,
            name: 'thumbsdown'
        };

    if (node >= 1 && node <= nodes.length) {
      exec(command, {
        user: process.env.SSH_USERNAME,
        host: nodes[nodeNum],
        key: process.env.SSH_KEY
      }, (err, stdout, stderr) => {
        if (!err) {
          bot.api.reactions.add(reactionUp, (err, res) => { });
          bot.reply(message, '```' + stdout + '```');
        }
        else {
          bot.api.reactions.add(reactionDown, (err, res) => { });
          bot.reply(message, 'Oh no! I failed running the command. I\'m sorry :worried:');
          bot.botkit.log('Failed to run command. ', err);
        }
      });
    }
    else {
      bot.api.reactions.add(reactionDown, (err, res) => { });
      bot.reply(message, 'Don\'t tell me to do something invalid!');
    }
  };
}
