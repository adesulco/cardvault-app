const https = require('https');

async function searchBingImages(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/murl&quot;:&quot;(htt[^&]+?)&quot;/g)];
        if (matches.length > 0) {
          resolve(matches[0][1]);
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

searchBingImages('Black Lotus PSA 10').then(url => console.log("Lotus:", url));
searchBingImages('Shohei Ohtani Topps Chrome Rookie Auto PSA 10').then(url => console.log("Ohtani:", url));
