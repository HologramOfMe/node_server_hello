/* 
* Primary file for the Hello World server API
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');


// Instantiate the HTTP server.
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the HTTP server, and have it dynamically determine the port to listen on
// depending on the environment it is opeating in.
httpServer.listen(config.httpPort, function() {
    console.log('The HTTP server is now listening on port ' + config.httpPort)
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log('The HTTPS server is now listening on port ' + config.httpsPort)
});

// Define the handlers
const handlers = {};

// Define the Hello World Handler.
handlers.hello = function(data, callback) {
    callback(200, {'message': "This is not the Hello World message you are looking for."});
};

// Not found handler
handlers.notFound = function(data, callback) {
    // Callback a http status code of 404 without a payload object.
    callback(404);
};

// Define a request router
const router = {
    'hello': handlers.hello
};

// All the server logic for both the http and https servers
const unifiedServer = function(req, res) {
    // Get the url and parse it. Second parameter tells url.parse to 
    // extract the query string from the URL while it's at it.
    const parsedUrl = url.parse(req.url, true);

    // Get the path from that url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object.
    // Note: Query String parameters should be separated with '&' in 
    // the URL string eg.'http://localhost:3000/foo/bar?gum=1234&hobo=rum'.
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method. Should be GET, POST, PUT, DELETE, or HEAD
    var method = req.method.toLowerCase();

    // Get the request headers as an object
    var headers = req.headers;

    // Get the payload if there is any.
    var decoder = new StringDecoder('utf-8');
    // Recieve the data stream, decode it and append the resulting
    // string into buffer variable.
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    // When the data stream ends...
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to.
        // If a handler is not found, use the notFound handler.
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the router.
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200.
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object 
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response.
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request information for testing.
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};