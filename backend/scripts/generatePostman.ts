import fs from 'fs';
import path from 'path';
import Converter from 'openapi-to-postmanv2';
import { swaggerSpec } from '../src/config/swagger';

const swaggerJson = JSON.stringify(swaggerSpec);

Converter.convert(
  { type: 'string', data: swaggerJson },
  { folderStrategy: 'Tags', requestParametersResolution: 'Example' },
  (err: any, conversionResult: any) => {
    if (!conversionResult.result) {
      console.error('Could not convert', conversionResult.reason);
    } else {
      let collection = conversionResult.output[0].data;
      
      // Post-process the collection to use {{baseUrl}} and {{accessToken}}
      
      // 1. Set baseUrl variable
      collection.variable = collection.variable || [];
      collection.variable.push({
        key: 'baseUrl',
        value: 'http://localhost:5001',
        type: 'string'
      });
      collection.variable.push({
        key: 'accessToken',
        value: 'your_jwt_token_here',
        type: 'string'
      });

      // 2. Iterate through all items to replace URL and auth
      const traverse = (items: any[]) => {
        for (const item of items) {
          if (item.item) {
            traverse(item.item);
          } else if (item.request) {
            // Replace url host with {{baseUrl}}
            if (item.request.url && item.request.url.host) {
              item.request.url.host = ['{{baseUrl}}'];
              // If there's a port, remove it since it's in baseUrl
              delete item.request.url.port;
            }

            // Set Auth to bearer token variable if endpoint requires auth
            // Check if auth exists in request or we can just set it globally
            item.request.auth = {
              type: 'bearer',
              bearer: [
                {
                  key: 'token',
                  value: '{{accessToken}}',
                  type: 'string'
                }
              ]
            };
          }
        }
      };

      if (collection.item) {
        traverse(collection.item);
      }

      const outputPath = path.resolve(__dirname, '../../postman_collection.json');
      fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
      console.log('Postman collection successfully generated and formatted at', outputPath);
    }
  }
);
