// Start a WebSocket connection with the server using SocketIO
var socket = io(); 	// Note that the SocketIO client-side library was imported on line 13 of index.html,
			// and this file (local.js) was imported on line 14 of index.html

// Key codes for W (UP), S (DOWN), A (LEFT), and D (RIGHT):
var UP = 87, DOWN = 83, LEFT = 65, RIGHT = 68;

// NOTE: if you prefer using the arrow keys, you could use this code instead:
// var UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;
// But it doesn't really matter :)

// When "new box" event is received, create new box with the received ID
socket.on('new box', function(boxId) {	
	console.log("New user connected with id: " + boxId);
	createBox(boxId);
});

// When "all previous boxes" event is received, create each box from the received array
socket.on('all previous boxes', function(boxes) {	
	console.log("All previous users/boxes:");
	console.log(boxes);
	boxes.forEach(function(box){
		createBox(box.id);
	});
});

// Create a new box on the page with the specified ID
function createBox(boxId) {
	// Create new element: <p class="box" id="ID GOES HERE"></p>
	var newBox = document.createElement('p');
	newBox.id = boxId;
	newBox.className = 'box';

	// Give the box a random color
	newBox.style.background = '#' + Math.floor(Math.random()*16777215).toString(16);

	// Give the box a random starting position somewhere in the viewport, not too close to being off an edge
	newBox.style.top = Math.floor(Math.random() * 91) + '%';
	newBox.style.left = Math.floor(Math.random() * 91) + '%';

	// Add it to the HTML <body> element to actually display the new box
	document.body.appendChild(newBox);
}

// Listen for key presses:
document.addEventListener('keydown', moveAndBroadcast);

// Move the "me" box according to key presses and send the data to the server
function moveAndBroadcast(event) {
	// Normalize key codes across browsers:
	var keyCode = event.which || event.keyCode || 0;
	
	// If one of our control keys was pressed, move the box and send the code to the server
	if ( keyCode == UP || keyCode == DOWN || keyCode == LEFT || keyCode == RIGHT ) {
		// Move the box on the screen accordingly:
		moveTheBox(keyCode, 'me');
		// Send the key code to the server, which will then broadcast it to other clients
		socket.emit( 'individual move', {key: keyCode, id: socket.id} );
	}
}

// When "individual move" event is received, move the box using the data received
socket.on('individual move', function(data){
	moveTheBox(data.key, data.id);
});

// This function actually MOVES the box on the page as needed using absolute positioning with CSS
function moveTheBox(keyCode, boxId) {

	var SCREENWIDTH = 100, SCREENHEIGHT = 100, BOXSIZE = 10, STEPSIZE = 1.5, direction = 1, newPositionValue = 0;

	// Create a variable for the HTML element with the id of the specified box/user
	var box = document.getElementById(boxId);

	// The below code is a bit tricky because it's doing a little math
	// to make the box wrap around if it goes off the edge of the screen.
	// But essentially it's just resetting the "top" or "left" CSS property
	// by either adding or subtracting a constant amount (STEPSIZE) to its existing position
	switch (keyCode) {
		case UP:
			direction = -1;
		case DOWN:
			newPositionValue = parseInt(box.style.top, 10) + (direction * STEPSIZE);
			if (newPositionValue >= SCREENHEIGHT) {
				box.style.top = (newPositionValue - SCREENHEIGHT) - BOXSIZE + '%';
			} else if (newPositionValue <= 0 - BOXSIZE) {
				box.style.top = newPositionValue + SCREENHEIGHT + BOXSIZE + '%';
			} else {
				box.style.top = newPositionValue + "%";
			}
			break;
		case LEFT:
			direction = -1;
		case RIGHT:
			newPositionValue = parseInt(box.style.left, 10) + (direction * STEPSIZE);
			if (newPositionValue >= SCREENWIDTH) {
				box.style.left = (newPositionValue - SCREENWIDTH) - BOXSIZE + '%';
			} else if (newPositionValue <= 0 - BOXSIZE) {
				box.style.left = newPositionValue + SCREENWIDTH + BOXSIZE + '%';
			} else {
				box.style.left = newPositionValue + "%";
			}
			break;
	}
}
