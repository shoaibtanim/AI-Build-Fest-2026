import fs from 'fs';

const content = fs.readFileSync('./public/assets/index-C_krY17A.js', 'utf-8');

console.log("Printing context at index 413927:");
console.log(content.slice(413500, 414500));
