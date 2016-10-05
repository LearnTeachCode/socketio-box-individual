// Setting up libraries and configuration
var express = require('express');	// The require() function includes the code for Express
var app = express();			// Initialize the Express library
var http = require('http').Server(app);	// Initialize an HTTP server
var io = require('socket.io')(http);	// Include and initialize SocketIO
var port = process.env.PORT || 8000;	// Set the default port number to 8000, or use Heroku's settings (process.env.PORT)

// Use Express to serve everything in the "public" folder as static files
app.use(express.static('public'));

// Activate the server and listen on our specified port number
http.listen(port, function() {
	// Display this message in the server console once the server is active
	console.log('Listening on port ' + port);
});

// An array to keep try of all connected clients' boxes:
var boxes = [];

// When a user connects over websocket,
io.on('connection', function(socket) {

	// Display this message in the server console
	console.log('A user connected! ID: ' + socket.id.substring(2) );	
	
	// Send new user's ID to notify all OTHER users
	// NOTE: substring(2) removes the first two characters from the ID string,
	// because the server appends two extra meaningless characters for some weird reason.
	socket.broadcast.emit('new box', socket.id.substring(2) );
	
	// Send list of all previously connected users to the new user
	socket.emit('all previous boxes', boxes);
	
	// Store new user's ID in the box array defined on line 18
	boxes.push(socket.id.substring(2));
	
	// When the server receives event named "individual move",
	socket.on('individual move', function(data) {
		// Display the received data in the server console
		console.log(data);
		// Send the data in a message called "individual move" to every connected client EXCEPT the client who sent this initial "individual move" message
		socket.broadcast.emit('individual move', data);
	});
	
	// When a user disconnects,
	socket.on('disconnect', function() {
		// Display message in server console
		console.log('A user disconnected! ID: ' + socket.id.substring(2) );
		
		// Remove their no-longer-needed box from the array		
		var indexToRemove = boxes.indexOf( socket.id.substring(2) );	// Get index of the ID to remove
		if (indexToRemove === -1) return;	// If that index wasn't found, return (to end this function early)
		boxes.splice(indexToRemove, 1);		// Otherwise (if the index WAS found), remove it from the boxes array
				
		// Alert all other users to remove this box
		socket.broadcast.emit( 'remove box', socket.id.substring(2) );		
	});

});	// End of SocketIO code
