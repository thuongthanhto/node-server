const http = require('http');
const app = require('./app');
const { port } = require('./config');

const PORT = port || 3000;

const server = http.createServer(app);

server.listen(PORT);
