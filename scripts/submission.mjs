// The skills only submission cases are maintained in chatgpt-app-submission.json.
import fs from 'node:fs/promises';
const j=JSON.parse(await fs.readFile('chatgpt-app-submission.json','utf8'));
if(j.test_cases.length!==5||j.negative_test_cases.length!==3||Object.keys(j.tools).length)throw Error('Invalid skills only submission cases');
console.log('Five positive and three negative cases; no MCP tools.');
