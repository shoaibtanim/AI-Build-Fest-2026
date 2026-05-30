import fs from 'fs';
try {
  console.log("Listing /workspace precisely:");
  console.log(fs.readdirSync('/workspace'));
} catch (e: any) {
  console.log("Error reading /workspace:", e.message);
}
try {
  console.log("Listing /:");
  console.log(fs.readdirSync('/'));
} catch (e: any) {
  console.log("Error reading /:", e.message);
}
