import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { classify, PublicError, MAX_IMAGE } from './classifier.mjs';
export async function handleMcp(request, env, reserve) {
  const server = new McpServer({name:'frankly-hotdog',version:'0.1.0'}, {instructions:'Classify a user selected image as HOTDOG, NOT HOTDOG, or UNCERTAIN for entertainment. Never claim browser hover access: that interaction requires the separately installed Frankly Hotdog browser extension.'});
  server.registerTool('classify_hotdog_image', {
    title:'Hotdog or not hotdog',
    description:'Classify a user selected image as HOTDOG or NOT HOTDOG for entertainment, with UNCERTAIN when unreadable. Accepts a public HTTPS image URL or a PNG/JPEG/WebP data URL. Sends the selected image to OpenAI for inference; does not store the image or classification. Use only images the user chooses to share. Does not inspect browser tabs, monitor a cursor, identify people, or assess food safety.',
    inputSchema:{image:z.string().min(32).max(MAX_IMAGE).describe('Public HTTPS image URL or base64 data URL for an image the user selected. Do not include private access tokens or sensitive images.')},
    outputSchema:{verdict:z.enum(['HOTDOG','NOT HOTDOG','UNCERTAIN']),message:z.string()},
    annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:true},
    _meta:{securitySchemes:[{type:'noauth'}]}
  }, async ({image}) => {
    try {
      const {validateImage}=await import('./classifier.mjs'); validateImage(image);
      await reserve();
      const result=await classify(image,env);
      return {content:[{type:'text',text:`${result.verdict}. ${result.message}`}],structuredContent:result};
    } catch(e) { return {isError:true,content:[{type:'text',text:e instanceof PublicError ? e.message : 'The classifier could not complete this request.'}]}; }
  });
  const transport = new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
  await server.connect(transport);
  return transport.handleRequest(request);
}
