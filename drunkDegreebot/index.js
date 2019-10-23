'use strict';

const https = require('https');

let send = (data, callback) => {
  let body = JSON.stringify(data);

  let req = https.request({
    hostname: "api.line.me",
    port: 443,
    path: "/v2/bot/message/reply",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "Authorization": "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
    }
  });

  req.end(body, (err) => {
    err && console.log("errror"+err);
    callback(err);
  });
}

exports.handler = (event, context, callback) => {
  let result = event.events && event.events[0];
  let templateJson = require("./template.json");
  if (result) {
    let content = event.events[0] || {};
    let messageObj = getMessage(content, templateJson);
    let message = {
        "replyToken":result.replyToken,
        "messages": [
          messageObj
        ]
    };
    send(message, () => {
      callback();
    });
  } else {
    callback();
  }
};

// @return Object
let getMessage = (data, templateJson) => {
  switch(data.type){
    case 'message':
      return templateJson.start;
    case 'postback':
      if(data.postback.data.indexOf('ans=true') !== -1){
        return templateJson.correctAns;
      }else if(data.postback.data.indexOf('ans=false') !== -1){
        return templateJson.wrongAns;
      }else{
        return templateJson.errorMsg;
      }
    default:
      return templateJson.errorMsg;
  }
}
