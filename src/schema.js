var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const DatabaseService = require("./database-service");

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => Books,
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Helloworld",
  fields: () => ({
    message: { type: GraphQLString, resolve: () => "hello world" },
  }),
});

//CREATE PRODUCT TABLE
//CREATE WARRANTIES TABLE

//ADD WARRANTY TO PRODUCT
//-READ PRODUCT, WHEN INFORMATION IS ADDED

//-WRITE WARRANTY DURATION TO PRODUCT

//CUSTOMER ADDS REGISTRATION
//IF AMAZON PRODUCT - ADD CODE TO CHECK WITH AMAZON IF PRODUCT WAS PURCHASED
//IF YES, PROCEED, IF NO, REJECT
//READ PRODUCT WARRANTY INFO, IF WARRANTY DURATION EXISTS
//ADD TO WARRANTIES TABLE - PRODUCT_ID, EXPIRATION_DATE, OWNER_NAME, OWNER_EMAIL
//BOUGHT-FROM AMAZON, AMAZON ORDER ID, PRODUCT NAME, WARRANTY DURATION, WARRANTY START

//READ WARRANTIES TABLE

var root = { hello: () => "Hello world!" };

module.exports = new GraphQLSchema({
  query: RootQuery,
});
