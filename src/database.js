const {
  DynamoDBClient,
  DeleteTableCommand,
  CreateTableCommand,
  ListTablesCommand,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  ScanCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

// Set the AWS Region
const REGION = "us-east-1"; //e.g. "us-east-1"

// Set the parameters

// Create DynamoDB service object
const dbclient = new DynamoDBClient({ region: REGION });

class database {
  constructor() {}

  async writeNewData(params) {
    console.log(params);
    try {
      const data = await dbclient.send(new PutItemCommand(params));
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  async updateData(params) {
    // console.log(params);
    try {
      const data = await dbclient.send(new UpdateItemCommand(params));
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  async getDataSingle(params) {
    console.log(params);
    const data = await dbclient.send(new GetItemCommand(params));
    // console.log("Success", data.Item);
    return data;
  }

  async getBatchData(params) {
    try {
      const data = await dbclient.send(new ScanCommand(params));
      console.log(data.Items.map((item) => console.log(item)));

      return data;
    } catch (err) {
      console.log("Error", err);
    }
  }
}

// const params = {
//   TableName: "products",
//   Key: {
//     "product-id": { S: "10" },
//   },
// };

// async function run() {
//   try {
//     const data = await dbclient.send(new DeleteItemCommand(params));
//     console.log(data);
//   } catch (err) {
//     console.log(err);
//   }
// }

// const params = {
//   AttributeDefinitions: [
//     {
//       AttributeName: "product-id", //ATTRIBUTE_NAME_1
//       AttributeType: "S", //ATTRIBUTE_TYPE
//     },
//     {
//       AttributeName: "warranty-exp",
//       AttributeType: "S",
//     },
//   ],
//   KeySchema: [
//     {
//       AttributeName: "product-id", //ATTRIBUTE_NAME_1
//       KeyType: "HASH",
//     },
//     {
//       AttributeName: "warranty-exp",
//       KeyType: "RANGE",
//     },
//   ],
//   ProvisionedThroughput: {
//     ReadCapacityUnits: 1,
//     WriteCapacityUnits: 1,
//   },
//   TableName: "warranty", //TABLE_NAME
//   StreamSpecification: {
//     StreamEnabled: false,
//   },
// };
// const run = async () => {
//   try {
//     const data = await dbclient.send(new CreateTableCommand(params));
//     console.log("Table Created", data);
//   } catch (err) {
//     console.log("Error", err);
//   }
// };
// run();

// var params = {
//   TableName: "warranty",
// };

// const run = async () => {
//   try {
//     const data = await dbclient.send(new DeleteTableCommand(params));
//     console.log("deleted", data);
//   } catch (err) {
//     console.log(err);
//   }
// };
// run();

module.exports = database;
