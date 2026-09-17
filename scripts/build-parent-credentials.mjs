import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const credentials = [
  ['Pooja Singh','pooja.singh','Parent@2026','Aadhya Singh'],['Manoj Kapoor','manoj.kapoor','Parent@2026','Arjun Kapoor'],['Rina Patel','rina.patel','Parent@2026','Bhavya Patel'],['Sonal Gupta','sonal.gupta','Parent@2026','Diya Gupta'],['Kiran Raj','kiran.raj','Parent@2026','Dev Raj'],['Meena Nair','meena.nair','Parent@2026','Ira Nair'],['Rakesh Jain','rakesh.jain','Parent@2026','Kabir Jain'],['Neha Sharma','neha.sharma','Parent@2026','Kiara Sharma'],['Ankit Mehta','ankit.mehta','Parent@2026','Laksh Mehta'],['Sunita Kumar','sunita.kumar','Parent@2026','Rajesh Kumar'],['Vandana Prasad','vandana.prasad','Parent@2026','Nisha Prasad'],['Anjali Sharma','anjali.sharma','Parent@2026','Aarav Sharma, Ananya Sharma'],['Amit Verma','amit.verma','Parent@2026','Pari Verma'],['Sonia Chawla','sonia.chawla','Parent@2026','Pranav Chawla'],['Ritu Malhotra','ritu.malhotra','Parent@2026','Riya Malhotra'],['Nitin Ahuja','nitin.ahuja','Parent@2026','Rudra Ahuja'],['Kavita Handa','kavita.handa','Parent@2026','Saanvi Handa'],['Deepak Tiwari','deepak.tiwari','Parent@2026','Shaurya Tiwari'],['Shweta Narang','shweta.narang','Parent@2026','Tanvi Narang'],['Pankaj Bansal','pankaj.bansal','Parent@2026','Ved Bansal'],['Aarti Sethi','aarti.sethi','Parent@2026','Vivaan Sethi'],['Rohit Dubey','rohit.dubey','Parent@2026','Yash Dubey'],['Saba Farooqi','saba.farooqi','Parent@2026','Zoya Farooqi'],['Priyanka Malik','priyanka.malik','Parent@2026','Ishaan Malik'],['Pallavi Rana','pallavi.rana','Parent@2026','Kavya Rana'],['Gaurav Saxena','gaurav.saxena','Parent@2026','Vihaan Saxena'],['Nidhi Pandey','nidhi.pandey','Parent@2026','Meera Pandey'],
];
const wb = Workbook.create();
const ws = wb.worksheets.add('Parent logins');
ws.showGridLines = false;
ws.getRange('A1:E1').merge(); ws.getRange('A1').values = [['ClassLine Parent Login Register']];
ws.getRange('A2:E2').merge(); ws.getRange('A2').values = [['Confidential - share credentials only with the named parent. Change the temporary password after first login.']];
ws.getRange('A4:E4').values = [['Parent / guardian','Username','Temporary password','Registered pupil(s)','Account status']];
ws.getRange(`A5:E${4 + credentials.length}`).values = credentials.map(row => [...row, 'Active']);
ws.getRange('A1:E1').format = { fill:'#1A1410', font:{name:'Arial', size:16, bold:true, color:'#F7F3ED'}, horizontalAlignment:'left', verticalAlignment:'center' };
ws.getRange('A2:E2').format = { fill:'#EDE4D9', font:{name:'Arial', size:10, italic:true, color:'#5A4F45'} };
ws.getRange('A4:E4').format = { fill:'#2A4A35', font:{name:'Arial', size:10, bold:true, color:'#FFFFFF'}, horizontalAlignment:'center', verticalAlignment:'center', borders:{preset:'outside',style:'thin',color:'#D4CDC4'} };
ws.getRange(`A5:E${4 + credentials.length}`).format = { font:{name:'Arial',size:10,color:'#1A1410'}, verticalAlignment:'center', borders:{preset:'inside',style:'thin',color:'#E8E2D8'} };
ws.getRange(`C5:C${4 + credentials.length}`).format.fill = '#FFF8E9';
ws.getRange(`E5:E${4 + credentials.length}`).format.fill = '#EDF7EF';
ws.getRange('A1:E1').format.rowHeight = 30; ws.getRange('A2:E2').format.rowHeight = 24; ws.getRange('A4:E4').format.rowHeight = 22;
ws.getRange('A:A').format.columnWidth = 22; ws.getRange('B:B').format.columnWidth = 22; ws.getRange('C:C').format.columnWidth = 21; ws.getRange('D:D').format.columnWidth = 34; ws.getRange('E:E').format.columnWidth = 16;
ws.freezePanes.freezeRows(4);
ws.tables.add(`A4:E${4 + credentials.length}`, true, 'ParentLogins');
wb.recalculate();
await fs.mkdir('output/xlsx', {recursive:true});
const output = await SpreadsheetFile.exportXlsx(wb); await output.save('output/xlsx/classline-parent-login-register.xlsx');
const preview = await wb.render({sheetName:'Parent logins',range:`A1:E${4 + credentials.length}`,scale:1,format:'png'}); await fs.writeFile('tmp/parent-login-register-preview.png',new Uint8Array(await preview.arrayBuffer()));
console.log((await wb.inspect({kind:'table',range:'Parent logins!A1:E10',include:'values',tableMaxRows:10,tableMaxCols:5})).ndjson);
