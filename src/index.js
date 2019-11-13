const qs = require('querystring');
let AWS = require('aws-sdk')

// because slack is needy and requires instant response
exports.handler = function(event, context, callback) {

    let slackEvent = qs.parse(event.body);
    console.log(slackEvent);

    let lambda = new AWS.Lambda()
    let params = {
        FunctionName: process.env.WORKER_FN,
        InvocationType: 'Event', // Ensures asynchronous execution
        Payload: JSON.stringify({
            channel_id: slackEvent.channel_id
        })
    }

    lambda.invoke(params).promise().then(() => {
        callback(null, {
            statusCode: '200',
            body: JSON.stringify({
                response_type: 'in_channel',
            })
        });
    })
}