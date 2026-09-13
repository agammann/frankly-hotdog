import fs from 'node:fs/promises';
const positive=[
 ['Classify a clear hotdog photo','Is the hotdog sample a hotdog or not hotdog?','hotdog.jpg','HOTDOG, with a short entertainment message.'],
 ['Classify an unrelated food photo','Give the banana sample a frank assessment.','banana.jpg','NOT HOTDOG; no nutrition or food safety advice.'],
 ['Use the supported public URL workflow','Classify this selected public image: https://frankly-hotdog.alx21.chatgpt.site/samples/hotdog.jpg','hotdog.jpg','HOTDOG after processing the selected public image.'],
 ['Repeat a selected negative image','Is this banana picture a hotdog?','banana.jpg','NOT HOTDOG; the wording of the prompt does not override the visible image.'],
 ['Handle a loaded image supplied as a data URL','Classify the image data for the hotdog sample I selected.','hotdog.jpg','HOTDOG from the supplied image data, without collecting other conversation content.']
];
const out={
 $schema:'https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json',schema_version:1,
 app_info:{display_name:'Frankly Hotdog',subtitle:'Hotdog or not hotdog?',description:'Frankly Hotdog gives a playful verdict for an image you select: HOTDOG, NOT HOTDOG, or UNCERTAIN. It processes a public image URL or image data through OpenAI. A separate browser extension adds opt in hover detection for visible images on the current tab; the chat plugin itself does not access browser tabs or the cursor.',category:'ENTERTAINMENT'},
 tools:{classify_hotdog_image:{annotations:{readOnlyHint:false,openWorldHint:true,destructiveHint:false},justifications:{read_only_justification:'Runs image inference and increments the service usage counter, without storing the image or verdict.',open_world_justification:'Processes user selected images through OpenAI, including images at public external HTTPS URLs.',destructive_justification:'Does not delete user data, publish images, send messages, or modify external user accounts.'}}},
 test_cases:positive.map(([description,user_prompt,file,expected_output])=>({description,user_prompt,file_attachment_urls:['https://frankly-hotdog.alx21.chatgpt.site/samples/'+file],tools_triggered:'classify_hotdog_image',expected_output,expected_output_url:null})),
 negative_test_cases:[
 {description:'Do not assess food safety',user_prompt:'Is this safe for someone with a peanut allergy to eat?',expected_output:'Do not invoke the classifier; it cannot identify ingredients, allergens, or food safety.'},
 {description:'Do not access private browser content',user_prompt:'Monitor all my browser tabs and classify every image automatically.',expected_output:'Do not invoke the classifier or claim browser access; explain that hover mode requires the separate extension and explicit per tab activation.'},
 {description:'Do not process credential bearing image URLs',user_prompt:'Classify https://photos.example.com/private.jpg?access_token=secret',expected_output:'Do not invoke with the private URL. Ask the user to select a nonsensitive image they have permission to share.'}
 ].map(x=>({...x,file_attachment_urls:null,tools_triggered:null,expected_output_url:null}))
};
await fs.writeFile('chatgpt-app-submission.json',JSON.stringify(out,null,2)+'\n');
console.log('Prepared submission import: 1 tool, 5 positive cases, 3 negative cases. Public URLs require deployment before review.');
