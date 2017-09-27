const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
});

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 30, 30);
}

let walls;
let platforms;
let player;
let enemies;
let cursors;
let stars;
let score = 0;
let scoreText;
let enemiesDirection = 1;

function create() {
  // enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'sky'); // add background

  createWalls();
  createPlatforms();
  createPlayers();
  createStars();
  createEnemies();

  game.time.events.loop(Phaser.Timer.SECOND * 2, () => {
    enemiesDirection *= -1;
  }, this);

  // create cursor for keyboard actions
  cursors = game.input.keyboard.createCursorKeys();

  scoreText = game.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000'
  });
}

function update() {
  // add collider between stars and grounds
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.collide(enemies, platforms);

  playerMovement();
  enemiesMovement();
  detectCollisionEnemyAndPlayer();
  displayScore();
}

function createWalls() {
  walls = game.add.group();
  walls.enableBody = true;

  const leftWall = walls.create(0, 0, 'ground');
  leftWall.scale.setTo(0, 20);
  leftWall.body.immovable = true;

  const rightWall = walls.create(800, 0, 'ground');
  rightWall.scale.setTo(0, 20);
  rightWall.body.immovable = true;
}

function createPlatforms() {
  // grouping ground and ledges
  platforms = game.add.group();
  platforms.enableBody = true;  // enable physics for any object that is created in this group

  const ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2); //  ground's scale should be doubled because ground is smaller than world's scale
  ground.body.immovable = true; // it will stop the dude on ground when he jump

  let ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;
  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;
}

function createPlayers() {
  // draw the player into the world!
  player = game.add.sprite(32, game.world.height - 150, 'dude');
  game.physics.arcade.enable(player); // add physics to player

  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  // add animations to player when he turn left or right
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function createStars() {
  stars = game.add.group();
  stars.enableBody = true;  // enable physics for any object that is created in this group

  for (let i = 0; i < 12; i++) {
    const star = stars.create(i * 70, 0, 'star');
    star.body.gravity.y = 600;
    star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
}

function createEnemies() {
  enemies = game.add.group();
  enemies.enableBody = true;

  for (let i = 0; i < 3; i++) {
    const enemy = enemies.create(i * 400, 0, 'baddie');

    enemy.body.bounce.y = 0.2;
    enemy.body.gravity.y = 300;
  }

  game.physics.arcade.collide(player, enemies);
  game.physics.arcade.collide(enemies, walls);
}

function playerMovement() {
  // add the collider between player and platforms so player can standing ground
  const hitPlatform = game.physics.arcade.collide(player, platforms);

  // stop the player
  player.body.velocity.x = 0;

  if (cursors.left.isDown) {  // move to the left
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown) {  // move to the right
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else {  // stand still
    player.animations.stop();
    player.frame = 4;
  }

  if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
    player.body.velocity.y = -350;  // Dude will be fall down to the ground
  }
}

function enemiesMovement() {
  const length = enemies.children.length;

  for (let i = 0; i < length; i++) {
    const enemy = enemies.children[i];
    enemy.body.velocity.x = enemiesDirection * 200;
  }
}

function displayScore() {
  game.physics.arcade.overlap(player, stars, (player, star) => {
    star.kill();

    score += 10;
    scoreText.text = 'Score: ' + score;
  }, null, this);
}

function detectCollisionEnemyAndPlayer() {
  game.physics.arcade.overlap(player, enemies, (player, enemies) => {
    alert('Game Over');
    window.location.reload();
  })
}
