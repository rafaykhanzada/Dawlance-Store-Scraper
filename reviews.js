const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapper(url){
         const browser = await puppeteer.launch({ headless: false });
         const page = await browser.newPage();
    
         await page.goto(url);
    
        var results = []; 
        const [rating] = await page.$x('//*[@id="module_product_review_star_1"]/div/a[1]');
        const product_rating = await (await rating.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));  
        let num = product_rating.split(" ")[0].replace('\"'," ").trim();
        // console.log(num);
        lastPageNumber = Math.round(num/5);  
        for (let index = 0; index < lastPageNumber; index++) {
            
           await page.waitForTimeout(1000)
            results =await results.concat(await extractedEvaluateCall(page));
            
            if (index != lastPageNumber - 1) {            
                await page.waitForSelector('#module_product_review > div > div:nth-child(3) > div.next-pagination.next-pagination-normal.next-pagination-arrow-only.next-pagination-medium.medium.review-pagination',{visible:true});
                await page.click('#module_product_review > div > div:nth-child(3) > div.next-pagination.next-pagination-normal.next-pagination-arrow-only.next-pagination-medium.medium.review-pagination > div');
                await page.click('#module_product_review > div > div:nth-child(3) > div.next-pagination.next-pagination-normal.next-pagination-arrow-only.next-pagination-medium.medium.review-pagination > div > button.next-btn.next-btn-normal.next-btn-medium.next-pagination-item.next');
                
            }
        }
        browser.close();
        return results;

}
async function extractedEvaluateCall(page) {
        return page.evaluate(() => {
            let data = [];
            var rating_score=0;
            let elements = document.querySelectorAll('.mod-reviews');
            
    
            elements[0].childNodes.forEach((value,index)=>{
                let star = value.childNodes[0].childNodes[0].childNodes.forEach((value,index)=>{
                    if (value.getAttribute('src')=='//laz-img-cdn.alicdn.com/tfs/TB19ZvEgfDH8KJjy1XcXXcpdXXa-64-64.png') {
                        rating_score++;
                    }
                })
                
                let person_name = value.childNodes[1].childNodes[0].innerText;
                let comment = value.childNodes[2].childNodes[0].innerText;
                var arr={
                             rating_score,
                            person_name,
                            comment
                        }
                        rating_score=0;
                        
                 data.push(arr);
            })      
            data = data.filter(function(item, pos) {
                return data.indexOf(item) == pos;
            })
            return data;
        });
    }

async function ReadCSV_urls(){
   
    let data_lines=require('fs').readFileSync('urls.txt', 'utf-8').split(/\r?\n/);
    for (let line in data_lines) {         
     let res = await scrapper("https:"+data_lines[line].replace(","," ").trim().toString());   
     var dir = './Products/'+data_lines[line].slice(24).split(".")[0];
     if (!fs.existsSync(dir)){
     await fs.mkdirSync(dir, { recursive: true });
  }
      await writeCSV(dir,res); 
            
    }
}

async function writeCSV(path,obj){
   await fs.appendFile(path+'/reviews.csv', JSON.stringify(obj).trim()+'\n', function (err) {
        if (err) throw err;
      });      
}

ReadCSV_urls();
module.exports = {scrapper}