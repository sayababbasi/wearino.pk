import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shopping Website API Documentation",
      version: "1.0.0",
      description:
        "Complete API documentation for the e-commerce shopping website",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User registration and login" },
      { name: "Products", description: "Product management" },
      { name: "Categories", description: "Product categories" },
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Orders", description: "Order management" },
      { name: "Wishlist", description: "User wishlist" },
      { name: "Inquiries", description: "Customer inquiries" },
      { name: "Payments", description: "Payment processing with Stripe" },
      { name: "Chat", description: "Chatbot support" },
      { name: "Analytics", description: "Analytics and reporting" },
      { name: "Admin Dashboard", description: "Admin dashboard statistics" },
    ],
  },
  apis: ["./routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
