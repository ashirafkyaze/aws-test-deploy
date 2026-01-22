# AWS Test App

A simple Node.js Express app for testing AWS hosting.

## Local Testing

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Visit http://localhost:3000 to see "Hello World"

## AWS Deployment

This app can be deployed to AWS services like Elastic Beanstalk, EC2, or Lambda.

- For Elastic Beanstalk: Zip the project (excluding node_modules) and upload via EB CLI or AWS console.
- For EC2: Upload files and run `npm install` and `npm start`.
- Ensure the PORT environment variable is respected (defaults to 3000).