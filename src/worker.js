const forcast = require('./snowForecast');
const { WebClient } = require('@slack/client');
const web = new WebClient(process.env.SLACK_TOKEN);

exports.handler = async function(event, context, callback) {

    try {
        let reportedResorts = await forcast.getSummaryReport();

        if (reportedResorts) {
            resorts = reportedResorts.map((r, i) => buildAttachment(r, i));

            await web.chat.postMessage({ channel: event.channel_id, text: '*Snow Forecast*', attachments: resorts});
        } else {
            await web.chat.postMessage({ channel: event.channel_id, text: '_oops. something went wrong, try again later_'});
        }
        
    } catch (e) {
        console.log(e);
    }  
}

function buildAttachment(resort, n) {
    let colors = [
        '#4363d8',
        '#42d4f4',
        '#3cb44b',
        '#f58231',
        '#000000',
        '#a9a9a9',
    ]
    return {
        fallback: `Resort: ${resort.resort_name}, Last Snow: ${convertText(resort.weather.last_snow)}, expected 3-day total: ${toInch(resort.weather.days_3)}\"`,
        color: colors[n] || colors[0],
        title: resort.resort_name,
        title_link: resort.resort_link,
        mrkdwn_in: ["text", "fields"],
        text: 
            `*Snow Depth* ${toInch(resort.conditions.depth_top,0)}\"/${toInch(resort.conditions.depth_bottom,0)}\" (Summit/Base)\n` +
            `*Last Snow* ${convertText(resort.weather.last_snow)}\n` +
            `*Snowfall Forecast*\n` +
            `\xa0\xa0\xa0\xa0_0-3 days:_ ${toInch(resort.weather.days_3)}\"\n` +
            `\xa0\xa0\xa0\xa0_3-6 days:_ ${toInch(resort.weather.days_6)}\"\n` +
            `\xa0\xa0\xa0\xa0_6-9 days:_ ${toInch(resort.weather.days_9)}\"\n` +
            `*Conditions* ${resort.conditions.on_piste}`,
        footer: `Updated: ${resort.reported}`
    }
}

function toInch(value, decimals=1) {
    return +(value * 0.393701).toFixed(decimals);
}

function convertText(value) {
    return value.replace(/(\d+)\s(cm)\s(.*)/, function(match, p1, p2, p3) {
        return toInch(p1) + ' in ' + p3;
    });
}

// exports.handler({channel_id:'C9K08UKHB'}, null, (a, data) => {
//     console.log(data);
// });