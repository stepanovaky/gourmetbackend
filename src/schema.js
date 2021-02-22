/* eslint-disable no-undef */
var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} = require("graphql");
const nodemailer = require('nodemailer');
const Product = require("./models/Product");
const Warranty = require("./models/Warranty");
const Customer = require("./models/Customer");
const { SENDER_EMAIL, SENDER_PASSWORD } = require('./config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

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
      resolve: async (parent) => {
        const { ownerEmail } = parent;
        const warranties = Warranty.find({ ownerEmail }).sort({ createdAt: -1 });
        const serializeWarranties = warranties.map((item) => {
          const productId = item.productId;
          const productName = item.productName;
          const warrantyExp = item.warrantyExp;
          const warrantyStart = item.warrantyStart;
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
    approval: { type: GraphQLString },
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
        const warranties = await Warranty.find().sort({ createdAt: -1 });
        return warranties;
      },
    },

    approvedWarranties: {
      type: new GraphQLList(WarrantyType),
      description: "Find specific product",
      resolve: async () => {
        const warranties = await Warranty.find({ approval: 'approved' }).sort({ createdAt: -1 });
        return warranties;
      },
    },

    allProducts: {
      type: new GraphQLList(ProductType),
      description: "Find specific product",
      resolve: async () => {
        // let params = [
        //   {
        //     productId: '6090276634774',
        //     productName: 'Garlic Easy',
        //     warrantyDuration: 2
        //   },
        //   {
        //     productId: '6090278895766',
        //     productName: 'Juicer',
        //     warrantyDuration: 3
        //   },
        //   {
        //     productId: '6090272899222',
        //     productName: 'Y Peeler',
        //     warrantyDuration: 5
        //   },
        // ];
        // let product = new Product(params[0]);
        // let product1 = new Product(params[1]);
        // let product2 = new Product(params[2]);
        // await product.save();
        // await product1.save();
        // await product2.save();
        const products = await Product.find().sort({ createdAt: -1 });
        return products;
      },
    },
    oneProduct: {
      type: new GraphQLList(ProductType),
      description: "Find specific product",
      args: {
        id: { type: GraphQLFloat },
      },
      resolve: async (parent, args) => {
        const productId = args.id;
        const product = await Product.findOne({productId});
        const { productName, warrantyDuration } = product;
        return [{ productId, productName, warrantyDuration }];
      },
    },

    allCustomers: {
      type: new GraphQLList(CustomerType),
      description: "Find specific customers",
      resolve: async () => {
        const customersList = await Customer.find().sort({ createdAt: -1 });
        const customers = customersList.filter(item => {
          return {
            ownerEmail: item.ownerEmail,
            ownerName: item.ownerName,
          };
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
      resolve: async () => {
        const { ownerEmail } = args;
        const customer = await Customer.findOne({ownerEmail});
        return customer;
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
        const { productName, productId } = args;
        const product = new Product({ productId, productName });
        await product.save();
        return product;
      },
    },

    addWarrantyToProduct: {
      type: ProductType,
      description: "Add warranty duration to product",
      args: {
        productId: { type: GraphQLNonNull(GraphQLString) },
        warrantyDuration: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args) => {
        const { productId, warrantyDuration } = args;
        const product = await Product.findOneAndUpdate(
          { productId },
          { warrantyDuration },
          { new: true }
        );
        return product;
      },
    },

    addCustomerRegistration: {
      type: WarrantyType,
      description: "Create warranty for product",
      args: {
        productId: { type: GraphQLNonNull(GraphQLString) },
        ownerEmail: { type: GraphQLNonNull(GraphQLString) },
        ownerName: { type: GraphQLNonNull(GraphQLString) },
        amazonOrderId: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { ownerEmail, ownerName, productId, amazonOrderId } = args;
        const product = await Product.findOne({productId});
        if (product) {
          const warrantyStart = new Date();
          const warrantyExp = new Date(
            warrantyStart.getFullYear() + product.warrantyDuration,
            warrantyStart.getMonth(),
            warrantyStart.getDate()
          );
          const data = {
            ownerEmail,
            ownerName,
            productId,
            productName: product.productName,
            origin: amazonOrderId ? "Amazon" : "Shopify",
            approval: "pending",
            warrantyStart,
            warrantyExp,
            amazonOrderId
          };
          const warranty = new Warranty(data);
          await warranty.save();
          const mailOptions = {
            from: SENDER_EMAIL,
            to: ownerEmail,
            subject: 'Product Warranty added',
            text: `Hi ${ownerName}. You warranty request for ${product.productName} was successfully registered.`
          };
          transporter.sendMail(mailOptions, (error, info) => {
            console.log(error ? error : `Email sent: ${info.response}`);
          });
          return warranty;
        }
        return null;
      },
    },

    addWarrantyApproval: {
      type: WarrantyType,
      description: "Approve warranty",
      args: {
        productId: { type: GraphQLNonNull(GraphQLString) },
        ownerEmail: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { productId, ownerEmail } = args;
        const product = await Product.findOne({ productId });
        const warranty = await Warranty.findOne({ productId, ownerEmail });
        const warrantyStart = new Date(warranty.warrantyStart);
        const warrantyExp = new Date(
          warrantyStart.getFullYear() + product.warrantyDuration,
          warrantyStart.getMonth(),
          warrantyStart.getDate()
        );
        warranty.warrantyExp = warrantyExp;
        warranty.approval = "approved";
        await warranty.save();
        const mailOptions = {
          from: SENDER_EMAIL,
          to: ownerEmail,
          subject: 'Product Warranty approved',
          text: `Hi ${ownerEmail}. You warranty request for ${product.productName} was successfully approved.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          console.log(error ? error : `Email sent: ${info.response}`);
        });
        return warranty;
        //code to update database's approval to approved,
        //probably send an email after
      },
    },

    warrantyDenied: {
      type: WarrantyType,
      description: "Deny warranty",
      args: {
        productId: { type: GraphQLNonNull(GraphQLString) },
        ownerEmail: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { productId, ownerEmail } = args;
        await Warranty.findOneAndRemove({ productId, ownerEmail });
        return {productId};
        //code to remove warranty
        //email?
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
