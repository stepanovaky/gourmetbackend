require("dotenv").config();
const AWS = require("aws-sdk");
const {
  DynamoDBClient,
  DeleteTableCommand,
} = require("@aws-sdk/client-dynamodb");

// Set the AWS Region
const REGION = "REGION"; //e.g. "us-east-1"

// Set the parameters
const params = {
  TableName: "TABLE_NAME",
};

// Create DynamoDB service object
const dbclient = new DynamoDBClient({ region: "us-east-1" });

const fetch = async () => {
  try {
    const data = await dbclient.send(new DeleteTableCommand(params));
    console.log("Success, table deleted", data);
  } catch (err) {
    if (err && err.code === "ResourceNotFoundException") {
      console.log("Error: Table not found");
    } else if (err && err.code === "ResourceInUseException") {
      console.log("Error: Table in use");
    }
  }
};

// let awsConfig = {
//   region: "us-east-1",
//   endpoint: "http://dynamodb.us-east-1.amazonaws.com",
//   accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
//   secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
// };

// AWS.config.update(awsConfig);

// let docClient = new AWS.DynamoDB.DocumentClient();
// let fetch = function () {
//   var params = {
//     TableName: "gourmeteasy_warranty",
//     Key: {
//       email: "test@gmail.com",
//     },
//   };
//   docClient.get(params, function (err, data) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("there");
//     }
//   });
// };

module.exports = fetch;
