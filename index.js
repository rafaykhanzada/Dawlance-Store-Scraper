const puppeteer=require('puppeteer');
const fs = require('fs');

async function scrapeProduct(url){
    const browser = await puppeteer.launch({ headless: false });
    const page =  await browser.newPage();
    await page.goto(url);      
    
    //Elements
    // const [id] = await page.$x('/html/head/meta[22]');


    let product_id = await page.evaluate(() => {
      let elements =document.querySelectorAll('.wooptpmProductId')[0];
      let data=    elements.getAttribute('data-id');
     return data;
  });
    let product_desc = await page.evaluate(() => {
      let res=[];
      let elements =document.querySelectorAll('#product-137171 > div.row.product-page.clearfix > div.main-data.col-sm-7 > div > div.woocommerce-product-details__short-description > div > ul');
      elements.forEach((elem,index)=>{
        res.push(elem.innerText)
      })
     return res;
  });
    // const product_id = await (await id.getProperty('data-id')).jsonValue().then((value)=>JSON.stringify(value));

    const [name] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/h1');
    const [init_price] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/p/del'); //*[@id="product-136794"]/div[1]/div[2]/div/p/span/bdi/text()
    let [price] =  await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/p/ins/span/bdi'); //*[@id="product-136794"]/div[1]/div[2]/div/p/span/bdi/text()
    const [des_price] =  await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/p/span/bdi'); //*[@id="product-136794"]/div[1]/div[2]/div/p/span/bdi/text()
    // const [short_desc_ul] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/div[1]/div/ul');
    const [short_desc] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/div[1]/div/p');
    const [image] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[1]/div[2]/figure/div/img');
    const [sku] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/div[2]/span[1]/span');
    const [category1] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/div[2]/span[2]/a[1]');
    const [category2] = await page.$x('//*[@id="product-'+product_id+'"]/div[1]/div[2]/div/div[2]/span[2]/a[2]');
    price =init_price!=null? price  :des_price;
    //Filter out data
    const product_name = await (await name.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const product_price = await (await price.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));    
    // const product_rating = await (await rating.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const product_brand = "Dawlance";
    // const product_desc_title = await (await desc_title.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const product_image = await (await image.getProperty('src')).jsonValue().then((value)=>JSON.stringify(value));
    const product_sku = await (await sku.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const product_short_desc = await (await short_desc.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const cat_1 = await (await category1.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const cat_2 = await (await category2.getProperty('innerText')).jsonValue().then((value)=>JSON.stringify(value));
    const product_category = cat_1 +","+cat_2;
    let Product_shortdesc=product_desc[0].toString()!=null ?? "";
   
    const product_model = "";
   
    //Basic Information
    var savingData =product_name + ','+product_sku+ ',' +product_price + ','+product_brand +','+Product_shortdesc+ ','+product_category+','+product_image + ',\n';
    await browser.close();
    return {savingData};
}

async function ReadCSV_urls(){
    let data_lines=require('fs').readFileSync('urls.txt', 'utf-8').split(/\r?\n/);
    for (let line in data_lines) {
       var temp = await scrapeProduct(data_lines[line].replace(","," ").trim().toString());   

      //  var dir = './Products/'+data_lines[line].slice(24).split(".")[0];
      //  if (!fs.existsSync(dir)){
      //  await fs.mkdirSync(dir, { recursive: true });
    // }
console.log(temp.savingData);
      await writeCSV(temp.savingData);
    }
}
async function writeCSV(obj){
   await fs.appendFile('Product.csv', obj, function (err) {
        if (err) throw err;
      });
}
ReadCSV_urls();
