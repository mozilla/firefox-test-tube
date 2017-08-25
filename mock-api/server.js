const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'api.json'));
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3001;

server.use(middlewares);

// Custom routes
server.use(jsonServer.rewriter({
    "/experiments": "/experiments-root",
}));

server.use(router);
server.listen(process.env.PORT || 3001, () => {
  console.log('json-server is running on port ' + port + '...');
});
