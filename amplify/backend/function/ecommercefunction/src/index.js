const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')

const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};


/* Cognito SDK */
const cognito = new
  AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18'
  })
/* Cognito User Pool ID
* This User Pool ID variable will be given to you by the CLI output after
adding the category
* This will also be available in the file itself, commented out at the top
*/
var userpoolId = process.env.< your_app_id >
// DynamoDB configuration
const region = process.env.REGION
const ddb_table_name = process.env.STORAGE_PRODUCTTABLE_NAME
const docClient = new AWS.DynamoDB.DocumentClient({ region })