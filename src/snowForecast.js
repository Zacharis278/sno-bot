let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');

const reqUrl = 'http://www.snow-forecast.com/my/'
const sessionToken = process.env.SF_TOKEN;

module.exports = {
    getSummaryReport: getSummaryReport
}

async function getSummaryReport() {

    try {
        let $ = cheerio.load(await fetchSnowData());

        let resortRows = $('.digest-table').first().find('.digest-row')
        let report = resortRows.map((i, ele) => {
            return {
                resort_name: $(ele).find('div.name a').text(),
                resort_link: 'https://www.snow-forecast.com' + $(ele).find('div.name a').attr('href') + '/6day/mid',
                reported: $(ele).find('td.name .report').text(),
                conditions: {
                    depth_top: $(ele).find('div.upper-depth .snow').text(),
                    depth_bottom: $(ele).find('div.lower-depth .snow').text(),
                    on_piste: $(ele).find('td.on-piste a').text().replace(/\n|\s/g,''),
                },
                weather: {
                    last_snow: $(ele).find('td.last-snowed').text().replace(/\s\s+/g, ' ').trim(),
                    days_3: Number($(ele).find('div.three-day .snow').text() || 0),
                    days_6: Number($(ele).find('div.six-day .snow').text() || 0),
                    days_9: Number($(ele).find('div.nine-day .snow').text() || 0),
                }
            }
        }).toArray();
    
        return report;
    } catch (e) {
        console.log('unable to parse HTML response' + e);
    }
    
}

async function fetchSnowData() {
    try {
        let res = await axios.get(reqUrl, {
            headers: {
                'Cookie': `_current_session=${sessionToken}`
            }
        });

        return res.data;
    } catch (e) {
        console.log('Failed to read snow-forcast html' + e);
    }
}