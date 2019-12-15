var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);
var inputKeys;
var player;
let playerVelocity = { x: 0, y: 0 };
let playerSpeed = 4;

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('grasstile1', 'assets/tiles/tile_17.png');
    this.load.image('dirttile1', 'assets/tiles/tile_05.png');
    this.load.image('watertile1', 'assets/tiles/tile_19.png');
    this.load.image('bush1', 'assets/tiles/tile_183.png');
}   

function create() {
  createMap(this);
  this.input.setPollAlways();
    var self = this;
    this.socket = io('http://127.0.0.1:3000');
    this.otherPlayers = this.add.group();
    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });
    this.socket.on('newPlayer', function (playerInfo) {
      addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setRotation(playerInfo.rotation);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            otherPlayer.setRotation(playerInfo.rotation);
          }
        });
	});
	this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
	this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
	this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
	this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
	delta = delta / 1000;
	if(this.wKey.isDown) {
		playerVelocity.y = -1;
	};
	if(this.aKey.isDown) {
		playerVelocity.x = -1;
	};
	if(this.sKey.isDown) {
		playerVelocity.y = 1;
	};
	if(this.dKey.isDown) {
		playerVelocity.x = 1;
	};

	this.player.setPosition(
		this.player.x+playerVelocity.x*playerSpeed,
		this.player.y+playerVelocity.y*playerSpeed
	);
	playerVelocity = { x: 0, y: 0 };

	let rotationX = game.input.mousePointer.worldX - this.player.x;
	let rotationY = game.input.mousePointer.worldY - this.player.y;
	this.player.rotation = Math.atan2(rotationY, rotationX) - (90 *(Math.PI / 180));

  this.cameras.main.startFollow(this.player);

	this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
}

function addPlayer(self, playerInfo) {
    self.player = self.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

function createMap(scene) {
  const tileTextures = ['grasstile1', 'dirttile1', 'watertile1', 'bush1'];
  const tiles = [
    [0, 0, 0, 1, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
  for(let y = 0; y < tiles.length; y++) {
    for(let x = 0; x < tiles[0].length; x++) {
      scene.add.image(x*64, y*64, tileTextures[tiles[y][x]]).setOrigin(0, 0);
    }
  }
}