var http = require('http');
var fs = require('fs');

var args = process.argv.slice(2);
var image = args[0];
var width = args[2];
var height = args[1];
var pixel_clicked= [];
var clients = [];


// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
  fs.readFile('./index.html', 'utf-8', function(error, content) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(content);
  });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);


//Mise en place du jeux
io.sockets.on('connection', function (socket) {
  clients.push('user');
  socket.broadcast.emit('user', clients);
  socket.emit('base', { image, height, width, pixel_clicked, clients });

  //Quand un client se deconnecte
  socket.on('disconnect', function() {
    clients.splice(clients.indexOf('user'), 1);
    socket.broadcast.emit('user', clients)
  });

  // Quand un client delete un pixel c'est émis aux autres
  socket.on('message', function (message) {

   /* if(pixel_clicked.length > 0) {
      pixel_clicked.find(function (pixel) {
        if (pixel.x != message.cell.x && pixel.y != message.cell.y) {
          pixel_clicked.push(message.cell);
        }
      })
    }
    else {*/
      pixel_clicked.push(message.cell);
    //}
    socket.emit('delete', {cell: message.cell, pixel_clicked});
    socket.broadcast.emit('delete', {cell: message.cell, pixel_clicked})
  });
});


server.listen(8080);