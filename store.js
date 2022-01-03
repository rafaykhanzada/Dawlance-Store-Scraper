
const puppeteer = require('puppeteer');
const fs = require('fs');

let scrape = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.dawlance.com.pk/product-category/refrigerator/');

    var results = []; 
    var lastPageNumber = 2;
   for (let index = 0; index < lastPageNumber; index++) {
    await page.waitForTimeout(1000)
    await page.click('#eluidac213b26');
     await page.waitForTimeout(3000)
     await page.click('#eluidac213b26');
     await page.waitForTimeout(1000)
     results =await results.concat(await extractedEvaluateCall(page));
    if (index != lastPageNumber - 1) { 
        // page.click('#content > div > div > div > div.kallyas-productlist-wrapper.kallyas-wc-cols--3 > nav > ul > li.next > a');           
        await page.waitForTimeout(3000)
    }
 
    // results = results.filter(function(item, pos) {
    //     return results.indexOf(item) == pos;
    // })
   
   }
    
   browser.close();
   return results;
};

async function extractedEvaluateCall(page) {
    return await page.evaluate(() => {
        let data = [];
        let elements =document.querySelectorAll('.prodpage-classic');
                elements.forEach((value,index)=>{                 
                    data.push(value.childNodes[1].childNodes[1].getAttribute('href')+'\n');                    
                })    
       return data;
    });
}

scrape().then((value) => {
    console.log(value);
    fs.appendFile('urls.txt', value.toString(), function (err) {
                if (err) throw err;
              });     
});


