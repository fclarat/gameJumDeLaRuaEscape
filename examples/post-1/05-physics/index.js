/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

const config = {
  type: Phaser.Physics.ARCADE,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = false;
let spaceKey;
let textDown;
let textUp;
let lookingTo = "down";
let map;
let worldLayer;
let puerta;
let telefono;
let armario;
let espejo;
let decoracion;
let escalera;

function preload() {
  this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");
  this.load.image('deLaRua', '../assets/images/portada.png');
  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "../assets/atlas/atlas.png", "../assets/atlas/atlas.json");
}

let items = {
  telefono: false,
  espejo: false,
  escalera: false,
  puerta: false,
};
let colision = false;
function create() {
  map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  telefono = map.createStaticLayer("Telefono", tileset, 0, 0);
  puerta = map.createStaticLayer("Puerta", tileset, 0, 0);
  armario = map.createStaticLayer("Armario", tileset, 0, 0);
  espejo = map.createStaticLayer("Espejo", tileset, 0, 0);
  decoracion = map.createStaticLayer("Decoracion", tileset, 0, 0);
  escalera = map.createStaticLayer("Escalera", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });
  telefono.setCollisionByProperty({ collides: true });
  espejo.setCollisionByProperty({ collides: true });
  puerta.setCollisionByProperty({ collides: true });
  escalera.setCollisionByProperty({ collides: true });


  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm rtsing setSize & setOffset to control the size of the player's body.
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);

  // player.scene.events.onInputDown.add(listener, this);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);
  this.physics.add.collider(player, telefono, () => {
    if (items.telefono == false && items.espejo == true) {
      colision = true;
      textDown = "Supermingo (Cavallo):Chupete? la cagamos. CORRÉ ";
      items.telefono = true;
      textUp = "Corré a la salida!!!                                 " 
    }
  });

  this.physics.add.collider(player, espejo, () => {
    if (items.espejo == false) {
      colision = true;
      textDown = "y dicen que soy aburrido... jaja fachero ";
      items.espejo = true;
      textUp = "'Ring Ring... suena el teléfono" 
      
    }
  });


  // Puerta
  this.physics.add.collider(player, puerta, () => {
    if (items.telefono == true && items.espejo == true && items.puerta == false) {
      colision = true;
      textDown = "Seguridad: Señor presidente esto sale al jardín ";
      items.puerta = true;
      textUp = "Busca como subir al helicoptero!                       " 
    }
  });



  // Escalera
  this.physics.add.collider(player, escalera, () => {
    if (items.telefono == true && items.espejo == true && items.escalera == false) {
      colision = true;
      textDown = "Batmannnnnnnn";
      items.escalera = true;
      //extUp = "Pudiste salir volando, Shakira te salvo las papas    " 
      this.add.sprite(380, 300, 'deLaRua');

    }
  });

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // Help text that has a "fixed" position on the screen
  // showTextUp("'Ring Ring... suena el teléfono", this)
  showTextUp("Es muy temprano. Me gustaría verme reflejado.", this)

  // Debug graphics
  this.input.keyboard.once("keydown_D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });

  spaceKey = this.input.keyboard.addKey("SPACE");
}

function showTextUp(data, _this) {
  let text = _this.add
    .text(250, 16, data, {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

  // setTimeout(() => {
  // setTimeout(() => {
  //   text.destroy();
  // }, 2000);
}

function showTextDown(data, _this) {
  let text = _this.add
    .text(250, 500, data, {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

  // setTimeout(() => {
  setTimeout(() => {
    text.destroy();
  }, 3000);
}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  this.input.keyboard.on("keydown", function(event) {
    if (event.keyCode != 32) {
      colision = false;
    }
  });

  if (spaceKey.isDown) {
    switch (lookingTo) {
      case "left":
        break;
      case "right":
        break;
      case "up":
        break;
      case "down":
        break;
    }

    if (colision == true) {
      //TODO: VER PARA PASAR UN ARRAY DE TEXTOS
      showTextDown(textDown, this);
      setTimeout(()=>{
        showTextUp(textUp, this);
      }, 1000)
      colision = false;
    }
  }

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    lookingTo = "left";
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    lookingTo = "right";
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    lookingTo = "down";
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    lookingTo = "up";
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }
}
