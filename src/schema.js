var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");
const DatabaseService = require("./database-service");

const ProductType = new GraphQLObjectType({
  name: "products",
  description: "This represents all of the products in the Gourmet Easy Store",
  fields: () => ({
    productId: { type: GraphQLNonNull(GraphQLString) },
    productName: { type: GraphQLNonNull(GraphQLString) },
    warrantyDuration: { type: GraphQLInt },
  }),
});

//add a customer type

const CustomerType = new GraphQLObjectType({
  name: "customer",
  description:
    "This represents all of the registered customers in the Gourmet Easy Store",
  fields: () => ({
    ownerEmail: { type: GraphQLNonNull(GraphQLString) },
    ownerName: { type: GraphQLNonNull(GraphQLString) },
    warranties: {
      type: new GraphQLList(WarrantyType),
      description: "All warranties associated with this customer",
      args: {
        ownerEmail: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const allWarranties = await DatabaseService.getAll("warranty");
        const specificWarranties = allWarranties.Items.filter(
          (warranty) => warranty["owner-email"].S === parent.ownerEmail
        );
        const serializeWarranties = specificWarranties.map((item) => {
          const productId = item["product-id"].S;
          const productName = item["product-name"].S;
          const warrantyExp = item["warranty-exp"].S;
          const warrantyStart = item["warranty-start"].S;

          // const origin = item.origin.S;

          return {
            productId,
            productName,
            warrantyExp,
            warrantyStart,
          };
        });
        return serializeWarranties;
      },
    },
  }),
});

const WarrantyType = new GraphQLObjectType({
  name: "warranty",
  description:
    "This represents all of the registered warranties in the Gourmet Easy Store",
  fields: () => ({
    productId: { type: GraphQLNonNull(GraphQLString) },
    productName: { type: GraphQLString },
    warrantyExp: { type: GraphQLString },
    warrantyStart: { type: GraphQLString },
    ownerEmail: { type: GraphQLNonNull(GraphQLString) },
    ownerName: { type: GraphQLNonNull(GraphQLString) },
    origin: { type: GraphQLString },
    amazonOrderId: { type: GraphQLString },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "query",
  description: "root query",
  fields: () => ({
    oneWarranty: {
      type: WarrantyType,
      description: "Find specific warranty",
      resolve: () => warranty,
    },

    allWarranties: {
      type: new GraphQLList(WarrantyType),
      description: "Find specific product",
      resolve: async () => {
        const item = await DatabaseService.getAll("warranty");
        const warrantyList = [];
        item.Items.map((item) => {
          const productId = item["product-id"].S;
          const productName = item["product-name"].S;
          const warrantyExp = item["warranty-exp"].S;
          const warrantyStart = item["warranty-start"].S;
          const ownerEmail = item["owner-email"] ? item["owner-email"].S : "";
          const ownerName = item["owner-name"].S;
          const origin = item.origin ? item.origin.S : "";

          warrantyList.push({
            productId,
            productName,
            warrantyExp,
            warrantyStart,
            ownerEmail,
            ownerName,
            origin,
          });
        });
        return warrantyList;
      },
    },
    allProducts: {
      type: new GraphQLList(ProductType),
      description: "Find specific product",
      resolve: async () => {
        const item = await DatabaseService.getAll("products");
        const productList = [];
        item.Items.map((item) => {
          const productId = item["product-id"].S;
          const productName = item["product-name"].S;
          const warrantyDuration = item["warranty-duration"]
            ? item["warranty-duration"].N
            : 0;
          productList.push({ productId, productName, warrantyDuration });
        });
        return productList;
      },
    },
    oneProduct: {
      type: new GraphQLList(ProductType),
      description: "Find specific product",
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const items = await DatabaseService.getOneProduct(args.id);
        const warrantyDuration = await items.Item["warranty-duration"].N;
        const productId = await items.Item["product-id"].S;
        const productName = await items.Item["product-name"].S;
        return [{ warrantyDuration, productId, productName }];
      },
    },

    allCustomers: {
      type: new GraphQLList(CustomerType),
      description: "Find specific customers",
      resolve: async () => {
        const items = await DatabaseService.getAll("warranty");
        const customers = [];
        const mapCustomers = items.Items.map((item) => {
          if (!customers.includes(item)) {
            customers.push({
              ownerEmail: item["owner-email"].S,
              ownerName: item["owner-name"].S,
            });
          }
        });
        return customers;
      },
    },
    OneCustomer: {
      type: new GraphQLList(CustomerType),
      description: "Find specific customers",
      args: {
        ownerEmail: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const items = await DatabaseService.getAll("warranty");
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "root mutation",
  fields: () => ({
    addProduct: {
      type: ProductType,
      description: "add a product",
      args: {
        productName: { type: GraphQLNonNull(GraphQLString) },
        productId: { type: GraphQLNonNull(GraphQLString) },
        amazonOrderId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        DatabaseService.writeProductToTable(args.productId, args.productName);
      },
    },
    addWarrantyToProduct: {
      type: ProductType,
      description: "Add warranty duration to product",
      args: {
        productId: { type: GraphQLNonNull(GraphQLFloat) },
        warrantyDuration: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args) => {
        DatabaseService.getProductToAddWarranty(
          args.productId,
          args.warrantyDuration
        );
      },
    },
    addCustomerRegistration: {
      type: WarrantyType,
      description: "Create warranty for product",
      args: {
        productId: { type: GraphQLNonNull(GraphQLFloat) },
        ownerEmail: { type: GraphQLNonNull(GraphQLString) },
        ownerName: { type: GraphQLNonNull(GraphQLString) },
        amazonOrderId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const customer_info = {
          "owner-email": args.ownerEmail,
          "owner-name": args.ownerName,
          origin: "amazon",
          "product-id": args.productId,
          "amazon-order-id": args.amazonOrderId,
        };
        DatabaseService.addCustomerRegistration(customer_info);
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

module.exports = schema;

//ORIGIN
