/*
 /!**
 * Created by Sagar on 08-May-16.
 *!/
 */

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame =
	w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// init
init = function() {
	var createCanvas = newCanvas( document ),
	    newImage     = createImage( imageData ),
	    canvas       = createCanvas( 512, 480 ),
	    reset        = resetGame( canvas ),
	    update       = updateGame( reset ),
	    render       = renderGame( newImage, canvas );

	//add canvas to dom
	document.getElementById( 'canvas_container' ).appendChild( canvas );

	//game loop
	var then     = Date.now(),
	    mainLoop = function() {
		    var gameState = gameData,
		        now       = Date.now(),
		        delta     = now - then;
		    gameState = render( update( gameState, delta / 1000 ) );
		    then = now;
		    requestAnimationFrame( mainLoop );
	    };
	gameData = reset( gameData );
	mainLoop();
};

window.addEventListener( 'load', init );

//player input events
addEventListener( 'keydown', function( event ) {
	gameData.player.keysDown[ event.keyCode ] = true;
}, false );

addEventListener( 'keyup', function( event ) {
	delete gameData.player.keysDown[ event.keyCode ];
}, false );

//render game screen
function renderGame( createImage, canvas ) {
	return function( gameData ) {
		var context     = canvas.getContext( "2d" ),
		    player      = gameData.player,
		    badGuy      = gameData.badGuy,
		    //create and draw images
		    bgImage     = createImage( 'background', function() {
			    context.drawImage( bgImage, 0, 0 );
		    } ),
		    playerImage = createImage( 'player', function() {
			    context.drawImage( playerImage, player.xPos, player.yPos );
		    } ),
		    badGuyImage = createImage( 'badGuy', function() {
			    context.drawImage( badGuyImage, badGuy.xPos, badGuy.yPos );
		    } );

		//display score
		context.fillStyle = "rgb(250, 250, 250)";
		context.font = "24px Helvetica";
		context.textAlign = "left";
		context.textBaseline = "top";
		context.fillText( "Score: " + gameData.score, 32, 32 );
	};
}

//update game
function updateGame( resetGame ) {
	return function( gameData, modifier ) {
		var player = gameData.player, badGuy = gameData.badGuy;

		if ( 38 in player.keysDown ) { // Player holding up
			player.yPos -= player.speed * modifier;
		}

		if ( 40 in player.keysDown ) { // Player holding down
			player.yPos += player.speed * modifier;
		}

		if ( 37 in player.keysDown ) { // Player holding left
			player.xPos -= player.speed * modifier;
		}

		if ( 39 in player.keysDown ) { // Player holding right
			player.xPos += player.speed * modifier;
		}

		//check for hit
		if ( player.xPos <= (badGuy.xPos + 32)
		     && badGuy.xPos <= (player.xPos + 32)
		     && player.yPos <= (badGuy.yPos + 32)
		     && badGuy.yPos <= (player.yPos + 32) ) {
			++gameData.score;
			gameData = resetGame( gameData );
		}
		return gameData;
	};
}

//reset game
function resetGame( canvas ) {
	return function( gameData ) {
		gameData.player.xPos = canvas.width / 2;
		gameData.player.yPos = canvas.height / 2;
		gameData.badGuy.xPos = 32 + (Math.random() * (canvas.width - 64));
		gameData.badGuy.yPos = 32 + (Math.random() * (canvas.height - 64));
		return gameData;
	};
}

//create a canvas
function newCanvas( document ) {
	return function( width, height ) {
		var canvas = document.createElement( "canvas" );
		canvas.width = width;
		canvas.height = height;
		return canvas;
	};
}

//create an image
function createImage( imageData ) {
	return function( imageName, callback ) {
		var image = new Image();
		image.src = imageData[ imageName ];
		image.onload = callback;
		image.onerror = function( e ) {
			console.log( 'image woes: ' + e )
		};
		return image;
	};
}

var gameData = {
	player : {
		speed    : 256, //PixPerSec
		xPos     : 0,
		yPos     : 0,
		keysDown : {}
	},
	badGuy : {
		xPos : 0,
		yPos : 0
	},
	score  : 0
};

var imageData = {
	background : "img/background.png",
	player     : "img/hero.png",
	badGuy     : "img/monster.png"
};