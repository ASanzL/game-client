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
var cursor;
var player;

function preload() {
    this.load.image('player', 'assets/player.png');
}   

function create() {
    var self = this;
    this.socket = io('https://game-server-sanz.herokuapp.com');
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
          }
        });
    });
    this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
    delta = delta / 1000;

    if (this.cursors.left.isDown){
        this.player.x -= (256 * delta);
        this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
    } if (this.cursors.right.isDown){
        this.player.x += (256 * delta);
        this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
    } if (this.cursors.up.isDown){
        this.player.y -= (256 * delta);
        this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
    } if (this.cursors.down.isDown){
        this.player.y += (256 * delta);
        this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
    }
}

function addPlayer(self, playerInfo) {
    self.player = self.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}