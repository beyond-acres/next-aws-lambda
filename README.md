# next-aws-lamba

Zero dependency AWS Lambda handler for your NextJS project.
No need for S3 buckets or Lambda@Edge.
Just one simple AWS Lambda.


## Example

```javascript
// lambda.js
const next = require('next')
const lambda = require('next-aws-lambda')

// If you run in dev, set timeout over 10 seconds and memory over 1024mb
// otherwise `sam local start-api` will time out
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

exports.handler = lambda(app, __dirname)
```
<br />

```typescript
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { CloudFrontToApiGatewayToLambda } from '@aws-solutions-constructs/aws-cloudfront-apigateway-lambda';

export class Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CloudFrontToApiGatewayToLambda(this, 'nextjs-site', {
      lambdaFunctionProps: {
        code: lambda.Code.fromAsset(`${__dirname}`),
        handler: 'lambda.handler',
        memorySize: 1024, // setup above 1024 if running in dev
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: cdk.Duration.seconds(10), // set to above 10 if running in dev
      }
    })
  }
}
```
