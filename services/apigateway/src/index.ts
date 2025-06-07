import express from 'express';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const PROTO_PATH = __dirname + '/../../auth/auth.proto';
const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = (loadPackageDefinition(packageDefinition) as any).auth;

const client = new authProto.AuthService(
  process.env.AUTH_SERVICE_HOST || 'localhost:50051',
  credentials.createInsecure()
);

const app = express();
app.use(express.json());

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  client.Register({ email, password }, (err: any, response: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json(response);
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  client.Login({ email, password }, (err: any, response: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json(response);
  });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  client.ForgotPassword({ email }, (err: any, response: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json(response);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
