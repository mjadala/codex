# Node.js Microservices Example

This repository contains a simple example of two microservices written in TypeScript:

- **auth service** – exposes a gRPC API for registering users, logging in and
  requesting a password reset.
- **api gateway** – Express application that exposes HTTP endpoints and
  communicates with the auth service via gRPC.

## Structure

```
services/
  auth/
    auth.proto        # gRPC definitions
    src/              # TypeScript source for the gRPC server
  apigateway/
    src/              # TypeScript source for the HTTP gateway
```

Each service has its own `package.json` and `tsconfig.json` for easy independent
builds.

## Building and running

Install dependencies for each service and build the TypeScript sources:

```bash
cd services/auth
npm install
npm run build
npm start
```

In another terminal:

```bash
cd services/apigateway
npm install
npm run build
npm start
```

The API gateway listens on port `3000` by default and forwards registration,
login and forgot password requests to the auth service via gRPC running on
`localhost:50051`.
