const HTTPS_PORT = 8443; //default port for https is 443
const HTTP_PORT = 8001; //default port for http is 80

const { exception } = require('console');
const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
// based on examples at https://www.npmjs.com/package/ws
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function (request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if (request.url === '/webrtc.js') {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.end(fs.readFileSync('client/webrtc.js'));
  } else if (request.url === '/style.css') {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.end(fs.readFileSync('client/style.css'));
  } else if (request.url === '/video') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(folder('video'));
  } else if (request.url[6] === '/') {
    response.writeHead(200, { 'Content-Type': 'video/webm' });
    response.end(fs.readFileSync(`.${request.url}`));
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(fs.readFileSync('client/index.html'));
  }
};

function folder (path) {
  const files = fs.readdirSync(path);
  const rows = [];
  const note = 'Please click file names above to view them.';
  for (let file of files) {
    const fileSizeInBytes = fs.statSync(`${path}/${file}`).size;
    if (file != '.gitignore') {
      rows.push(`<tr><td class="file-size"><code>${fileSizeInBytes} B</code></td><td class="display-name"><a href="${path}/${file}"target="_blank">${file}</a></td></tr>`);
    }
  }
  return (`<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport"content="width=device-width"/><title>Index of /${path}</title>`
    + `<style type="text/css">table tr{white-space:nowrap}td.file-size{text-align:right;padding-left:1em}td.display-name{padding-left:1em}`
    + `</style></head><body><h1>Index of /${path}</h1><table>${rows.join('')}</table><br/><note>${note}</note></body></html>`);
}

const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', function (ws) {
  let file;
  let filePath;
  ws.on('message', function (message) {
    if (message[0] == '{') { // textual message
      const parsed = JSON.parse(message);
      if (parsed.dest != undefined && parsed.dest == 'all') {
        const created = new Date();
        filePath = `./video/${parsed.displayName}.${parsed.uuid}._D_${created.toStamp()}_.webm`;
        file = fs.createWriteStream(filePath, { flags: 'a', encoding: 'base64', });
      }
      // Broadcast all received textual messages to all clients
      console.log('received: %s', message);
      wss.broadcast(message);
    } else {
      file.write(message, { encoding: 'base64' });
    }
  });

  ws.on('error', () => ws.terminate());
});

wss.broadcast = function (data) {
  this.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

console.log('Server running.'
);

// ----------------------------------------------------------------------------------------

// RFC
if (!Date.prototype.toStamp) {
  Date.prototype.toStamp = function () {
    return this.getFullYear() +
      '-' + (this.getMonth() + 1).toString().padStart(2, '0') +
      '-' + (this.getDate()).toString().padStart(2, '0') +
      '_T_' + (this.getHours()).toString().padStart(2, '0') +
      '-' + (this.getMinutes()).toString().padStart(2, '0') +
      '-' + (this.getSeconds()).toString().padStart(2, '0') +
      '-' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
  };
}

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https
http.createServer(function (req, res) {
  console.log(req.headers['host'] + req.url);
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(HTTP_PORT);