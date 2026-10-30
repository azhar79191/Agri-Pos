import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir,readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {renderInvoiceEmail}=require('../../agri-pos-backend/src/services/invoiceEmail.js');
const origin='http://127.0.0.1:5186';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5186','--strictPort'],{windowsHide:true,stdio:'ignore'});
let browser,page;
try{
 for(let attempt=0;attempt<100;attempt++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
 let settings={shopName:'Evergreen Agricultural',brandName:'Evergreen',brandTagline:'Growing better, together.',brandColor:'#145a46',shopAddress:'18 Garden Road, Lahore',shopPhone:'+92 300 1234567',shopEmail:'hello@example.test',currency:'Rs.',receiptTemplate:'standard',emailTemplate:'standard',receiptFooter:'Thank you for choosing Evergreen. We look forward to serving you again.',emailFooter:'Your trusted partner for every growing season.',actionEmailEvents:[],actionEmailRecipients:[]};
 const user={_id:'aaaaaaaaaaaaaaaaaaaaaaaa',name:'Admin',role:'admin',shop:{_id:'bbbbbbbbbbbbbbbbbbbbbbbb',name:settings.shopName,isApproved:true,isActive:true,planStatus:'active',...settings}};
 await context.addInitScript(user=>{if(window.top!==window)return;localStorage.setItem('user',JSON.stringify(user));localStorage.setItem('posUser',JSON.stringify(user));sessionStorage.setItem('token','isolated-fixture');},user);
 let sends=0;
 await context.routeWebSocket('**/*',s=>s.close());
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname.replace(/^\/api/,'');
  if(url.origin===origin&&request.resourceType()==='document')return route.continue();
  let data;
  if(path==='/auth/profile')data={user};
  else if(path==='/settings'){if(request.method()==='PUT')settings={...settings,...request.postDataJSON()};data={settings};}
  else if(path==='/settings/email-status')data={provider:'smtp',providerConfigured:true,jobs:[]};
  else if(path==='/settings/email-preview'){
   const draft=request.postDataJSON();const content=renderInvoiceEmail({...(draft.previewScenario==='partial'?{paymentStatus:'Partial',amountPaid:2000,creditAmount:2987.5}:draft.previewScenario==='refunded'?{paymentStatus:'Refunded',refundAmount:4987.5}:{}),invoiceNumber:'PREVIEW-001',customerName:'Ayesha Farms',status:'Completed',paymentMethod:'Cash',subtotal:5000,discount:250,taxAmount:237.5,total:4987.5,items:[{name:'Crop nutrition blend',quantity:2,unitPrice:1850,total:3700},{name:'Garden care essentials',quantity:1,unitPrice:1300,total:1300}]},{...settings,...draft,name:draft.shopName,address:draft.shopAddress,phone:draft.shopPhone,email:draft.shopEmail});data=content;
  }else if(path==='/settings/test-email'){sends++;data={accepted:true};}
  else if(path==='/notifications')data={notifications:[],unreadCount:0};
  else if(path==='/shops')data={shops:[user.shop]};
  else if(path.startsWith('/src/')||path.startsWith('/node_modules/')||path.startsWith('/@')||path.endsWith('.js')||path.endsWith('.css'))return route.continue();
  else data={};
  return route.fulfill({json:{success:true,data}});
 });
 page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const css=await readFile('src/components/invoiceDocument.css','utf8');
 const documentPage=await context.newPage();
 const captureDocument=async(path,width=850)=>{
   const markup=await page.locator('.invoice-document').evaluate(element=>element.outerHTML);
   await documentPage.setViewportSize({width,height:1100});
   await documentPage.setContent('<html><head><style>*{box-sizing:border-box}body{margin:0}h1,h2,h3,p,dl,dd{margin:0}table{border-collapse:collapse}'+css+'</style></head><body>'+markup+'</body></html>');
   await documentPage.locator('article').screenshot({path});
 };
 await page.goto(origin+'/settings');await page.getByRole('heading',{name:'Invoice & email template studio'}).waitFor();
 await page.getByText('Document content & email preferences',{exact:true}).click();
 await page.getByLabel('Tax registration number',{exact:true}).fill('TX-2026-001');
 await page.getByLabel('Payment instructions',{exact:true}).fill('Bank transfer: Evergreen account 12345.');
 await page.getByLabel('Terms & conditions',{exact:true}).fill('Please retain this invoice for your records.');
 await page.getByLabel('Invoice email Reply-To',{exact:true}).fill('accounts@example.test');
 await page.getByLabel('Invoice email subject',{exact:true}).fill('Receipt {invoiceNumber} from {company}');
 await page.getByLabel('Invoice email introduction',{exact:true}).fill('Hello {customer}, thank you for choosing {company}.');
 await page.getByLabel('Document date format',{exact:true}).selectOption('iso');
 await mkdir('artifacts/templates',{recursive:true});
 for(const design of ['Signature','Letterhead','Minimal']){
  await page.getByRole('button',{name:`Use ${design} design for invoices and emails`}).click();
  await captureDocument(`artifacts/templates/${design.toLowerCase()}-invoice.png`);
  await page.getByRole('button',{name:'Email',exact:true}).click();
  const frame=page.frameLocator('iframe[title="Complete email preview"]');await frame.getByText('Crop nutrition blend',{exact:true}).waitFor();
  await page.locator('iframe[title="Complete email preview"]').screenshot({path:`artifacts/templates/${design.toLowerCase()}-email.png`});
  await page.getByRole('button',{name:'Full invoice',exact:true}).click();
 }
 await page.getByRole('button',{name:'Save brand settings',exact:true}).click();await page.getByText('Company settings are up to date',{exact:true}).waitFor();
 assert.equal(settings.receiptTemplate,'minimal');assert.equal(settings.emailTemplate,'minimal');
 assert.equal(settings.invoiceTerms,'Please retain this invoice for your records.');
 assert.equal(settings.emailReplyTo,'accounts@example.test');
 await page.reload();await page.getByRole('heading',{name:'Invoice & email template studio'}).waitFor();
 assert.equal(await page.getByLabel('Invoice design',{exact:true}).inputValue(),'minimal');
 await page.getByLabel('Preview example',{exact:true}).selectOption('partial');
 await page.getByRole('button',{name:'Full invoice',exact:true}).click();
 await page.locator('.document-totals').getByText('Balance due',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Email',exact:true}).click();
 await page.frameLocator('iframe[title="Complete email preview"]').getByText('Balance due',{exact:true}).waitFor();
 await page.getByLabel('Preview example',{exact:true}).selectOption('refunded');
 await page.getByRole('button',{name:'Full invoice',exact:true}).click();
 await page.locator('.document-totals').getByText('Refunded amount',{exact:true}).waitFor();
 await page.getByLabel('Preview example',{exact:true}).selectOption('paid');
 await page.getByRole('button',{name:'Generated PDF',exact:true}).click();await page.locator('iframe[title="Generated invoice PDF preview"]').waitFor();
 await page.getByRole('button',{name:'Full invoice',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await captureDocument('artifacts/templates/mobile-invoice.png',390);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,'No horizontal page overflow on mobile');
 await page.getByRole('button',{name:'Email',exact:true}).click();
 await page.frameLocator('iframe[title="Complete email preview"]').getByText('Crop nutrition blend',{exact:true}).waitFor();
 const emailFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url()==='about:srcdoc');
 assert.equal(await emailFrame.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,'Email preview fits a phone viewport');
 assert.equal(sends,0,'Previews must not send email');assert.deepEqual(errors,[]);
 console.log('Template browser checks passed: all three designs, dynamic content, saved preferences after reload, partial/refunded examples, generated PDF preview, mobile overflow, no email sends, no runtime errors.');
}catch(error){if(page){await mkdir('artifacts/templates',{recursive:true});await page.screenshot({path:'artifacts/templates/failure.png',fullPage:true});console.error((await page.locator('body').innerText()).slice(-1800));}throw error;}
finally{if(browser)await browser.close();server.kill();}
