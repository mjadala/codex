import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { randomBytes, pbkdf2Sync } from 'crypto';

const PROTO_PATH = __dirname + '/../auth.proto';

const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = (loadPackageDefinition(packageDefinition) as any).auth;

interface User {
  email: string;
  passwordHash: string;
  salt: string;
}

const users = new Map<string, User>();

function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

const server = new Server();

server.addService(authProto.AuthService.service, {
  Register: (call: any, callback: any) => {
    const { email, password } = call.request;
    if (users.has(email)) {
      return callback(null, { success: false });
    }
    const salt = randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    users.set(email, { email, passwordHash, salt });
    return callback(null, { success: true });
  },
  Login: (call: any, callback: any) => {
    const { email, password } = call.request;
    const user = users.get(email);
    if (!user) {
      return callback(null, { success: false });
    }
    const hashed = hashPassword(password, user.salt);
    if (hashed !== user.passwordHash) {
      return callback(null, { success: false });
    }
    const token = randomBytes(16).toString('hex');
    return callback(null, { success: true, token });
  },
  ForgotPassword: (call: any, callback: any) => {
    const { email } = call.request;
    if (!users.has(email)) {
      return callback(null, { success: false });
    }
    // In a real app we'd send an email here
    return callback(null, { success: true });
  },
});

const PORT = process.env.PORT || '50051';

server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to start gRPC server', err);
    return;
  }
  server.start();
  console.log(`Auth service gRPC server running on port ${port}`);
});
