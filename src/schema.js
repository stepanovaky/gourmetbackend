var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

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

var root = { hello: () => "Hello world!" };

module.exports = new GraphQLSchema({
  query: RootQuery,
});
