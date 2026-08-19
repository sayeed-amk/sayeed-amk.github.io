//Sayeed Khurhseed s5414889 Creative Codeing Assignment 3
// Fallback: silent sound object used when audio files cannot load
// (e.g. when the game is opened directly from disk via file:///)
function makeSilentSound() {
  return { play: function(){}, loop: function(){}, stop: function(){},
           setVolume: function(){}, pause: function(){},
           isPlaying: function(){ return false; } };
}
// Constants for scene states
const SCENES = {
    LOADING: 0,
    MENU: 1,
    GAME: 2,
    LEADERBOARD: 3
  };
  
  // Current scene
  let currentScene = SCENES.LOADING;
  let loadingStartTime;
  let loadingDuration = 3000; // 3 seconds loading screen
  
  // Game objects and arrays
  let player;
  let enemies = [];       // Array for enemy ships
  let bullets = [];       // Array for player bullets
  let enemyBullets = [];  // Array for enemy bullets
  let powerups = [];      // Array for powerups
  let particles = [];     // Array for particle effects
  let stars = [];         // Array for background stars
  
  // Game variables
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let gamePaused = false;
  let playerName = "Player";
  
  // Game progression variables
  let currentStage = 1;
  let enemiesDefeated = 0;
  let bossActive = false;
  let bossDefeated = false;
  let stageComplete = false;
  let stageClearTime = 0;
  
  // Asset variables
  let playerSprite;
  let enemySprite;
  let bossSprite;
  let fastEnemySprite;
  let powerupSprite;
  let bulletSound;
  let explosionSound;
  let powerupSound;
  let backgroundMusic;
  let bossMusic;
  let introVideo;
  let backgroundImage;
  
  // GUI elements
  let nameInput;
  let difficultySlider;
  let startButton;
  
  // Leaderboard data
  let leaderboardData = [];
  
  // Preload function - load all assets
  function preload() {
    // Load sprites
    playerSprite = loadImage(SPRITE_DATA.player_ship);
    enemySprite = loadImage(SPRITE_DATA.enemy_ship);
    bossSprite = loadImage(SPRITE_DATA.boss_ship);
    fastEnemySprite = loadImage(SPRITE_DATA.fast_enemy);
    powerupSprite = loadImage(SPRITE_DATA.powerup);
    
    // Load sounds
    bulletSound = loadSound('sounds/laser.mp3', undefined, function() { bulletSound = makeSilentSound(); });
    explosionSound = loadSound('sounds/explosion.mp3', undefined, function() { explosionSound = makeSilentSound(); });
    powerupSound = loadSound('sounds/powerup.mp3', undefined, function() { powerupSound = makeSilentSound(); });
    backgroundMusic = loadSound('sounds/background_music.mp3', undefined, function() { backgroundMusic = makeSilentSound(); });
    bossMusic = loadSound('sounds/boss_music.mp3', undefined, function() { bossMusic = makeSilentSound(); });
    
    // Load video
    introVideo = createVideo('videos/intro.mp4');
    introVideo.hide();
    
    // Load background image
    backgroundImage = loadImage(SPRITE_DATA.space_background);
    
    // Load JSON data for leaderboard
    loadJSON('leaderboard.json', function(data) {
      leaderboardData = data.scores;
    }, function() {
      // Fallback leaderboard when the JSON cannot be fetched (file:///)
      leaderboardData = [
        { name: "SpaceAce", score: 12450, date: "15-05-2023" },
        { name: "StarLord", score: 10820, date: "12-05-2024" },
        { name: "CosmicQueen", score: 9560, date: "18-05-2024" },
        { name: "AlienHunter", score: 8975, date: "10-05-2024" },
        { name: "GalaxyGuardian", score: 7840, date: "14-05-2024" }
      ];
    });
  }
  
  // Setup function - called once at the beginning
  function setup() {
    createCanvas(800, 600);
    //createCanvas(windowWidth, windowHeight)
    loadingStartTime = millis();
    
    // Create GUI elements
    nameInput = createInput('Player');
    nameInput.position(width / 2 - 100, height / 2 + 180);
    nameInput.size(200, 30);
    nameInput.hide();
    
    difficultySlider = createSlider(1, 3, 2, 1);
    difficultySlider.position(width / 2 - 100, height / 2 + 130);
    difficultySlider.style('width', '200px');
    difficultySlider.hide();
    
    startButton = createButton('START GAME');
    startButton.position(width / 2 - 100, height / 2 + 80);
    startButton.size(200, 40);
    startButton.mousePressed(startGame);
    startButton.hide();
    
    // Create stars for background
    createStars(100);
  }
  
  function draw() {
    background(0);
    
    // Show/hide GUI elements based on current scene
    updateGUIVisibility();
    
    // Display different scenes based on currentScene
    switch (currentScene) {
      case SCENES.LOADING:
        drawLoadingScene();
        break;
      case SCENES.MENU:
        drawMenuScene();
        break;
      case SCENES.GAME:
        drawGameScene();
        break;
      case SCENES.LEADERBOARD:
        drawLeaderboardScene();
        break;
    }
  }
  
  // Loading scene
  function drawLoadingScene() {
    // Calculate loading progress
    let progress = constrain((millis() - loadingStartTime) / loadingDuration, 0, 1);
    
    // Update stars for background effect
    updateStars();
    displayStars();
    
    // Draw loading bar
    fill(50);
    rect(width / 4, height / 2, width / 2, 20);
    fill(0, 255, 0);
    rect(width / 4, height / 2, width / 2 * progress, 20);
    
    // Display loading text
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("LOADING...", width / 2, height / 2 - 40);
    
    // Automatic transition to menu after loading completes
    if (progress >= 1) {
      currentScene = SCENES.MENU;
      
      // Start background music
      backgroundMusic.setVolume(0.5);
      backgroundMusic.loop();
    }
  }
  
  // Menu scene
  function drawMenuScene() {
    // Draw background
    image(backgroundImage, 0, 0, width, height);
    
    // Update and display stars
    updateStars();
    displayStars();
    
    // Play intro video on top portion
    if (introVideo.time() === 0) {
      introVideo.loop();
    }
    image(introVideo, width / 2 - 200, 50, 400, 225);
    
    // Title
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("R-TYPE GAME", width / 2, height / 2 );
    
    // Display difficulty text
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Difficulty:", width / 2, height / 2 + 100);
    
    let difficultyLabels = ["Easy", "Normal", "Hard"];
    let diffValue = difficultySlider.value();
    fill(255, 255, 0);
    text(difficultyLabels[diffValue - 1], width / 2, height / 2 + 160);
    
    // Name input label
    fill(255);
    textAlign(RIGHT, CENTER);
    text("Name:", width / 2 - 110, height / 2 + 200);
    
    // Leaderboard option (separate from button)
    textAlign(CENTER, CENTER);
    fill(mouseIsOverRect(width / 2 - 100, height / 2 + 240, 200, 40) ? color(255, 255, 0) : 255);
    text("VIEW LEADERBOARD", width / 2, height / 2 + 240);

    //show controls used
    textAlign(RIGHT, RIGHT );
    text("Controls", width-50, 375)
    text("Move = asdw + Arrows", width-5, 400);
    text("Shoot = Spacebar", width-5, 450);
    text("esc = Home PAge", width-5, 500);
  }
  
  // Game scene
  function drawGameScene() {
    // Draw background image
    image(backgroundImage, 0, 0, width, height);
    
    // Update and display stars
    updateStars();
    displayStars();
    
    // Initialize the game if player isn't created yet
    if (!player) {
      initGame();
    }
    
    // Handle pause state
    if (gamePaused) {
      fill(0, 0, 0, 150); // Semi-transparent overlay with only alpha
      rect(0, 0, width, height);
      
      fill(255);
      textSize(48);
      textAlign(CENTER, CENTER);
      text("PAUSED", width / 2, height / 2);
      textSize(24);
      text("Press P to resume", width / 2, height / 2 + 60);
      return;
    }
    
    // Show stage complete message if applicable
    if (stageComplete) {
      updateStageProgress();
      return;
    }
    
    // Game over state
    if (gameOver) {
      fill(255);
      textSize(64);
      textAlign(CENTER, CENTER);
      text("GAME OVER", width / 2, height / 2);
      textSize(32);
      text("Score: " + score, width / 2, height / 2 + 60);
      text("Press R to Restart", width / 2, height / 2 + 120);
      text("Press esc to Home Page", width / 2, height / 2 + 150);
      return;
    }
    // Update game objects
    updateGameScene();
  }
  
  // Leaderboard scene
  function drawLeaderboardScene() {
    // Draw background
    image(backgroundImage, 0, 0, width, height);
    // Update and display stars
    updateStars();
    displayStars();
    
    fill(255);
    textSize(48);
    textAlign(CENTER, TOP);
    text("LEADERBOARD", width / 2, 50);
    
    // Display leaderboard entries
    textSize(24);
    textAlign(LEFT, TOP);
    
    fill(255, 255, 0);
    text("RANK", width / 4 - 10, 150);
    text("NAME", width / 2 - 100, 150);
    text("SCORE", width * 3/4, 150);
    //text("Date", 10, 150);
    
    fill(255);
    for (let i = 0; i < leaderboardData.length; i++) {
      let y = 200 + i * 40;
      text((i + 1), width / 4 - 10, y);
      text(leaderboardData[i].name, width / 2 - 100, y);
      text(leaderboardData[i].score, width * 3/4, y);
      //text(leaderboardData[i].date, 5, y);
    }
    // Back button
    //? = Ternary operator, short cut for if else
    //used as: condition ? ValueTrue : ValueFalse
    textAlign(CENTER, CENTER);
    fill(mouseIsOverRect(100, 20, 200, 50) ? color(255, 255, 0) : 255);
    text("BACK TO MENU", 100, 20);
  }

  // Player class
  class Player {
    constructor() {
      this.x = 100;
      this.y = height / 2;
      this.width = 60;
      this.height = 30;
      this.speed = 5;
      this.shootCooldown = 0;
      this.powerupActive = false;
      this.powerupType = 0;
      this.powerupTimer = 0;
      this.bulletType = 0;
    }
    
    update() {
      // Movement controls
      if (keyIsDown(87) || keyIsDown(UP_ARROW)) { // W or UP
        this.y -= this.speed;
      }
      if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { // S or DOWN
        this.y += this.speed;
      }
      if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) { // A or LEFT
        this.x -= this.speed;
      }
      if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { // D or RIGHT
        this.x += this.speed;
      }
      
      // Keep player within the canvas boundaries
      //constrain(value, min, max), constrain() function is a boundary-limiting function 
      this.x = constrain(this.x, 0, width - this.width);
      this.y = constrain(this.y, 0, height - this.height);
      
      // Decrease shoot cooldown
      if (this.shootCooldown > 0) {
        this.shootCooldown--;
      }
      
      // Handle powerup timer
      if (this.powerupActive) {
        this.powerupTimer--;
        if (this.powerupTimer <= 0) {
          this.powerupActive = false;
        }
      }
    }
    
    shoot() {
      if (this.shootCooldown <= 0) {
        // Create bullet(s) based on powerup status
        if (this.powerupActive) {
          switch(this.powerupType) {
            case 1: // Triple shot
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 0, 0));
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2 - 15, -1, 0));
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2 + 15, 1, 0));
              this.shootCooldown = 20;
              break;
            case 2: // Laser
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 0, 1));
              this.shootCooldown = 10;
              break;
            case 3: // Plasma
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 0, 2));
              this.shootCooldown = 25;
              break;
            default: // Normal shot or shield
              bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 0, 0));
              this.shootCooldown = 15;
          }
        } else {
          // Normal shot
          bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 0, 0));
          this.shootCooldown = 15;
        }
        
        // Play bullet sound
        bulletSound.play();
      }
    }
    
    display() {
      // Draw player ship
      image(playerSprite, this.x, this.y, this.width, this.height);
      fill(0, 255, 255);
      ellipse(this.x - 5, this.y + this.height / 2, 10 , 10 );
      
      // Visual indicator for active powerup
      if (this.powerupActive) {
        noFill();
        strokeWeight(2);
        stroke(0, 255, 255, 150);
        ellipse(this.x + this.width / 2, this.y + this.height / 2, 
                this.width * 1.5, this.height * 1.5);
        noStroke();
      }
    }
    
    activatePowerup(type) {
      this.powerupActive = true;
      this.powerupType = type;
      this.powerupTimer = 600; // 10 seconds at 60fps
      powerupSound.play();
    }
    //checking if the edges getting collide 
    checkCollision(obj) {
      return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y
      );
    }
  }
  
  // Enemy class
  class Enemy {
    constructor(y) {
      this.x = width;
      this.y = y || random(50, height - 50);
      this.width = 40;
      this.height = 30;
      this.speed = random(1, 3);
      this.shootCooldown = random(60, 120);
      this.health = 2;
      this.frameCount = 0; // For animation
    }
    
    update() {
      this.x -= this.speed;
      
      // Random movement up and down
      this.y += random(-1, 1);
      this.y = constrain(this.y, 0, height - this.height);
      
      // Enemy shooting
      if (this.shootCooldown <= 0) {
        enemyBullets.push(new EnemyBullet(this.x, this.y + this.height / 2));
        this.shootCooldown = random(60, 120);
      } else {
        this.shootCooldown--;
      }
      
      // Animation frame
      this.frameCount = (this.frameCount + 1) % 30;
    }
    
    display() {
      let w = this.width
      let h = this.height
      image(enemySprite, this.x - (w - this.width) / 2, 
            this.y - (h - this.height) / 2, w, h);
    }
    
    checkCollision(bullet) {
      return (
        this.x < bullet.x + bullet.width &&
        this.x + this.width > bullet.x &&
        this.y < bullet.y + bullet.height &&
        this.y + this.height > bullet.y
      );
    }
    
    hit() {
      this.health--;
      return this.health <= 0;
    }
  }
  
  // Boss class
  class Boss extends Enemy {
    constructor() {
      super(height / 2);
      this.width = 80;
      this.height = 80;
      this.health = 10;
      this.shootCooldown = 30;
      this.movePattern = 0; // 0: vertical, 1: diagonal
      this.verticalDir = 1; // 1: down, -1: up
      this.speed = 1;
    }
    
    update() {
      // Boss doesn't move horizontally after entering screen
      if (this.x > width - 150) {
        this.x -= this.speed;
      }
      // Movement pattern
      if (this.movePattern === 0) { // Vertical
        this.y += this.speed * 2 * this.verticalDir;
        // Change direction when hitting edges
        if (this.y < 50 || this.y > height - 50 - this.height) {
          this.verticalDir *= -1;
        }
      } else { // Diagonal
        this.x += cos(frameCount * 0.02) * 2;
        this.y += sin(frameCount * 0.03) * 2;
      }
      
      // Keep within bounds
      this.y = constrain(this.y, 0, height - this.height);
      this.x = constrain(this.x, width / 2, width - this.width);
      
      // Shooting pattern - every few frames, shoot multiple bullets
      if (this.shootCooldown <= 0) {
        // Shoot 3 bullets in different directions
        for (let angle = -0.3; angle <= 0.3; angle += 0.3) {
          let bullet = new EnemyBullet(this.x, this.y + this.height / 2);
          bullet.speed = 6;
          bullet.angle = angle;
          enemyBullets.push(bullet);
        }
        this.shootCooldown = 60;
      } else {
        this.shootCooldown--;
      }
      // Switch movement pattern occasionally
      if (random(1) < 0.005) {
        this.movePattern = this.movePattern === 0 ? 1 : 0;
      }
    }
    
    display() {
      image(bossSprite, this.x, this.y, this.width, this.height);
      // Health bar extra animation for Boss ship
      fill(255, 0, 0);
      rect(this.x, this.y - 20, this.width, 10);
      fill(0, 255, 0);
      rect(this.x, this.y - 20, this.width * (this.health / 10), 10);
    }
  }
  
  // Fast Enemy class
  class FastEnemy extends Enemy {
    constructor(y) {
      super(y);
      this.speed = random(4, 6);
      this.health = 1;
    }
    
    update() {
      this.x -= this.speed;
      // Fast enemy zigzags
      this.y += sin(frameCount * 0.1 + this.x * 0.05) * 3;
      this.y = constrain(this.y, 0, height - this.height);
      
      // Fast enemies don't shoot
      this.shootCooldown = 1000;
    }
    
    display() {
      image(fastEnemySprite, this.x, this.y, this.width, this.height);
    }
  }
  
  // Bullet class
  class Bullet {
    constructor(x, y, yDirection = 0, type = 0) {
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 5;
      this.speed = 10;
      this.yDirection = yDirection; // 0: straight, -1: up, 1: down
      this.type = type; // 0: normal, 1: laser, 2: plasma
      
      // Set color and properties based on type
      switch(this.type) {
        case 0: // Normal
          this.color = color(0, 255, 255);
          break;
        case 1: // Laser
          this.color = color(255, 0, 0);
          this.width = 15;
          this.height = 3;
          this.speed = 15;
          break;
        case 2: // Plasma
          this.color = color(0, 255, 0);
          this.width = 12;
          this.height = 12;
          this.speed = 8;
          break;
      }
    }
    update() {
      this.x += this.speed;
      this.y += this.yDirection * 2;
      
      // Special effect for plasma bullets: wobble
      if (this.type === 2) {
        this.y += sin(frameCount * 0.2) * 1;
      }
    }
    
    display() {
      fill(this.color);
      
      if (this.type === 2) { // Plasma is round
        ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);
      } else {
        rect(this.x, this.y, this.width, this.height);
      }
      
      // Glow effect for laser
      if (this.type === 1) {
        noFill();
        strokeWeight(2);
        stroke(255, 100, 100, 150);
        rect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        noStroke();
      }
    }
    
    isOffScreen() {
      return this.x > width || this.y < 0 || this.y > height;
    }
  }
  
  // Enemy Bullet class
  class EnemyBullet {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 5;
      this.speed = 7;
      this.color = color(255, 0, 0);
      this.angle = 0; // Direction angle
    }
    update() {
      if (this.angle === 0) {
        // Straight shot
        this.x -= this.speed;
      } else {
        // Angled shot
        this.x -= cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
      }
    }
    display() {
      fill(this.color);
      rect(this.x, this.y, this.width, this.height);
    }
    isOffScreen() {
      return this.x < 0 || this.y < 0 || this.y > height;
    }
  }
  // Powerup class
  class Powerup {
    constructor() {
      this.x = width;
      this.y = random(50, height - 50);
      this.width = 30;
      this.height = 30;
      this.speed = 3;
      this.type = floor(random(4)); // 0: shield, 1: triple shot, 2: laser, 3: plasma
      this.rotation = 0;
      this.colors = [
        color(0, 100, 255),   // Shield: blue
        color(255, 255, 0),   // Triple: yellow
        color(255, 0, 0),     // Laser: red
        color(0, 255, 0)      // Plasma: green
      ];
    }
    
    update() {
      this.x -= this.speed;
      this.rotation += 0.05; // Rotate the powerup
    }
    display() {
      push();
      translate(this.x + this.width / 2, this.y + this.height / 2);
      rotate(this.rotation);
      // Use powerup sprite
      image(powerupSprite, -this.width / 2, -this.height / 2, this.width, this.height);
      // Overlay color tint based on type
      noStroke();
      fill(this.colors[this.type].levels[0], this.colors[this.type].levels[1], 
           this.colors[this.type].levels[2], 100);
      rect(-this.width / 2, -this.height / 2, this.width, this.height);
      pop();
    }
    
    isOffScreen() {
      return this.x + this.width < 0;
    }
  }
  
  // Particle class for effects
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = random(-2, 2);
      this.vy = random(-2, 2);
      this.alpha = 255;
      this.size = random(2, 8);
      this.color = color || [255, 255, 255];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 5;
      this.size *= 0.95;
    }
    display() {
      noStroke();
      fill(this.color[0], this.color[1], this.color[2], this.alpha);
      ellipse(this.x, this.y, this.size, this.size);
    }
    isDead() {
      return this.alpha <= 0 || this.size <= 0.5;
    }
  }
  
  // Create explosion particles
  function createExplosion(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color));
    }
  }
  
  // Update all particles
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].display();
      
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
  }
  
  // Create stars for background
  function createStars(count) {
    for (let i = 0; i < count; i++) {
      stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        speed: random(1, 3)
      });
    }
  }
  
  // Update stars for space parallax effect
  function updateStars() {
    for (let i = 0; i < stars.length; i++) {
      stars[i].x -= stars[i].speed;
      // Reset stars that go off screen
      if (stars[i].x < 0) {
        stars[i].x = width;
        stars[i].y = random(height);
      }
    }
  }
  
  // Display stars
  function displayStars() {
    fill(255);
    noStroke();
    for (let i = 0; i < stars.length; i++) {
      ellipse(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
    }
  }
  
  // Spawn a new enemy
  function spawnEnemy() {
    // Increase spawn rate based on stage
    let spawnRate = 0.02 * (1 + (currentStage - 1) * 0.5);
    
    if (random(1) < spawnRate) {
      // 20% chance for fast enemy in later stages
      if (currentStage > 1 && random(1) < 0.2) {
        enemies.push(new FastEnemy());
      } else {
        enemies.push(new Enemy());
      }
    }
  }
  
  // Spawn boss
  function spawnBoss() {
    enemies.push(new Boss());
    
    // Switch to boss music
    backgroundMusic.stop();
    bossMusic.loop();
  }
  
  // Spawn powerups occasionally
  function spawnPowerup() {
    if (random(1) < 0.005) { // 0.2% chance per frame
      powerups.push(new Powerup());
    }
  }
// Start game function (for button)
function startGame() {
    playerName = nameInput.value() || "Player";
    setDifficulty(difficultySlider.value());
    currentScene = SCENES.GAME;
    resetGame();
  }
  
  // Set game difficulty based on slider
  function setDifficulty(level) {
    switch(level) {
      case 1: // Easy
        lives = 5;
        break;
      case 2: // Normal
        lives = 3;
        break;
      case 3: // Hard
        lives = 2;
        break;
    }
  }
  
  // Check and save high score
  function checkAndSaveHighScore() {
    // Check if the current score is high enough to be on the leaderboard
    let isHighScore = false;
    if (leaderboardData.length < 10) {
      isHighScore = true;
    } else {
      let lowestScore = leaderboardData[leaderboardData.length - 1].score;
      if (score > lowestScore) {
        isHighScore = true;
      }
    }
    
    if (isHighScore) {
      // Add the new score
      let newEntry = {
        name: playerName,
        score: score,
        date: new Date().toISOString().slice(0, 10)
      };
      
      leaderboardData.push(newEntry);
      
      // Sort by score (descending)
      leaderboardData.sort((a, b) => b.score - a.score);
      // Keep only top 10
      if (leaderboardData.length > 10) {
        leaderboardData = leaderboardData.slice(0, 10);
      }
    }
  }
  
  // Update stage progress
  function updateStageProgress() {
    // If boss isn't active yet and enough enemies are defeated, spawn boss
    if (!bossActive && !bossDefeated && enemiesDefeated >= 10 * currentStage) {
      spawnBoss();
      bossActive = true;
    }
    
    // If boss is defeated, show stage clear message
    if (bossDefeated && !stageComplete) {
      stageComplete = true;
      stageClearTime = frameCount;
    }
    
    // If stage is complete, show message for a few seconds, then advance
    if (stageComplete) {
      // Display stage clear message
      fill(255, 255, 0);
      textSize(48);
      textAlign(CENTER, CENTER);
      text("STAGE " + currentStage + " COMPLETE!", width / 2, height / 2);
      
      // After 3 seconds, advance to next stage
      if (frameCount - stageClearTime > 180) {
        currentStage++;
        enemiesDefeated = 0;
        bossActive = false;
        bossDefeated = false;
        stageComplete = false;
        
        // Restore player health as reward
        lives = min(lives + 2, 5);
      }
    }
  }
  
  // Display Heads-Up Display (score, lives)
  function displayHUD() {
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Score: " + score, 10, 10);
    text("Lives: " + lives, 10, 40);
    text("Stage: " + currentStage, 10, 70);
    
    // Display player name and active powerup
    textAlign(RIGHT, TOP);
    textSize(16);
    text("Player: " + playerName, width - 10, 10);
    
    // Show powerup status if active
    if (player && player.powerupActive) {
      let powerupTypes = ["Shield", "Triple Shot", "Laser", "Plasma"];
      let timeLeft = ceil(player.powerupTimer / 60); // Convert to seconds
      text(powerupTypes[player.powerupType] + ": " + timeLeft + "s", width - 10, 40);
    }
    
    // Show pause hint
    text("Press P to pause", width - 10, 70);
  }
  
  // Update GUI visibility based on current scene
  function updateGUIVisibility() {
    // Name input only visible in menu
    if (currentScene === SCENES.MENU) {
      nameInput.show();
      difficultySlider.show();
      startButton.show();
    } else {
      nameInput.hide();
      difficultySlider.hide();
      startButton.hide();
    }
  }
  
  // Reset game state
  function resetGame() {
    player = new Player();
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerups = [];
    particles = [];
    score = 0;
    lives = 3;
    gameOver = false;
    gamePaused = false;
    currentStage = 1;
    enemiesDefeated = 0;
    bossActive = false;
    bossDefeated = false;
    stageComplete = false;
    
    // Settting difficulty based on slider
    if (typeof difficultySlider !== 'undefined') {
      setDifficulty(difficultySlider.value());
    }
    
    // Making sure the correct music is playing
    if (typeof backgroundMusic !== 'undefined' && typeof bossMusic !== 'undefined') {
      bossMusic.stop();
      backgroundMusic.loop();
    }
  }
  
  // Initialize the game
  function initGame() {
    resetGame();
  }
  
  // Helper function to check if mouse is over a rectangle
  function mouseIsOverRect(x, y, w, h) {
    return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  }
  
  // Mouse pressed function for interactions
  function mousePressed() {
    switch (currentScene) {
      case SCENES.MENU:
        // Check if leaderboard option is clicked
        if (mouseIsOverRect(width / 2 - 100, height / 2 + 240, 200, 40)) {
          currentScene = SCENES.LEADERBOARD;
        }
        break;
      case SCENES.LEADERBOARD:
        // Check if back button is clicked
        if (mouseIsOverRect(100, 20, 200, 50)) {
          currentScene = SCENES.MENU;
        }
        break;
    }
  }
  
  // Keyboard interactions
  function keyPressed() {
    // Press ESC to return to menu from game or leaderboard
    if (keyCode === ESCAPE) {
      if (currentScene === SCENES.GAME || currentScene === SCENES.LEADERBOARD) {
        currentScene = SCENES.MENU;
        // Stop any game-specific sounds
        if (typeof bossMusic !== 'undefined') {
          bossMusic.stop();
        }
        // Restart menu music
        if (typeof backgroundMusic !== 'undefined' && !backgroundMusic.isPlaying()) {
          backgroundMusic.loop();
        }
      }
    }
    
    // Press R to restart game
    if (keyCode === 82) { // R key
      if (currentScene === SCENES.GAME && gameOver) {
        resetGame();
      }
    }
    
    // Press P to pause/unpause game
    if (keyCode === 80) { // P key
      if (currentScene === SCENES.GAME && !gameOver) {
        gamePaused = !gamePaused;
      }
    }
  }
  // Update the game scene with all objects
  function updateGameScene() {
    // Update stage progress
    updateStageProgress();
    
    // Update and display player
    player.update();
    player.display();
    
    // Shooting with space bar
    if (keyIsDown(32)) { // SPACE
      player.shoot();
    }
    
    // Spawn new enemies if not in boss fight
    if (!bossActive) {
      spawnEnemy();
    }
    
    // Spawn powerups
    spawnPowerup();
    // Update and display enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].display();
      // Remove enemies that go off screen
      if (enemies[i].x + enemies[i].width < 0) {
        enemies.splice(i, 1);
      }
    }
    
    // Update and display powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      powerups[i].update();
      powerups[i].display();
      
      // Check for collision with player
      if (player.checkCollision(powerups[i])) {
        player.activatePowerup(powerups[i].type);
        powerups.splice(i, 1);
        continue;
      }
      // Remove powerups that go off screen
      if (powerups[i].isOffScreen()) {
        powerups.splice(i, 1);
      }
    }
// Update and display player bullets
for (let i = bullets.length - 1; i >= 0; i--) {
    // Make sure the bullet exists before using it
    if (!bullets[i]) continue;
    bullets[i].update();
    bullets[i].display();
    let bulletRemoved = false;
    // Check for collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      // Make sure the enemy exists
      if (!enemies[j]) continue;
      if (enemies[j].checkCollision(bullets[i])) {
        // Hit enemy
        if (enemies[j].hit()) {
          // Enemy destroyed
          score += 100;
          // Check if it was a boss
          if (enemies[j] instanceof Boss) {
            bossDefeated = true;
            // Switch back to normal music
            bossMusic.stop();
            backgroundMusic.loop();
            // Create large explosion
            createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2, 50, [255, 200, 0]);
            // Extra points for boss
            score += 1000;
          } else {
            // Regular enemy explosion
            createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2, 20, [255, 100, 100]);         
            // Count defeated enemies
            enemiesDefeated++;
          }
          explosionSound.play();
          enemies.splice(j, 1);
        } else {
          // Enemy hit but not destroyed
          createExplosion(bullets[i].x, bullets[i].y, 5, [200, 200, 200]);
        }
        // Remove bullet unless it's a plasma type (which passes through)
        if (bullets[i] && bullets[i].type !== 2) {
          bullets.splice(i, 1);
          bulletRemoved = true;
          break;
        }
      }
    }
    // Skip the rest of this iteration if bullet was removed
    if (bulletRemoved) continue;
    // Check if bullet is off screen - only if bullet still exists
    if (bullets[i] && bullets[i].isOffScreen()) {
      bullets.splice(i, 1);
    }
  }
  // Also updating the enemy bullets section to be same time
  // Update and display enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    // Make sure the bullet exists
    if (!enemyBullets[i]) continue;
    enemyBullets[i].update();
    enemyBullets[i].display();
    // Check for collisions with player
    if (player && player.checkCollision(enemyBullets[i])) {
      // If shield powerup is active, just remove the bullet
      if (player.powerupActive && player.powerupType === 0) {
        createExplosion(enemyBullets[i].x, enemyBullets[i].y, 10, [0, 100, 255]);
        enemyBullets.splice(i, 1);
        continue;
      }
      // Otherwise, lose a life
      lives--;
      createExplosion(player.x + player.width / 2, player.y + player.height / 2, 30, [255, 255, 255]);
      explosionSound.play();
      enemyBullets.splice(i, 1);
      
      if (lives <= 0) {
        gameOver = true;
        // Save score to leaderboard if high enough
        checkAndSaveHighScore();
      }
      continue;
    }
    // Remove enemy bullets that go off screen
    if (enemyBullets[i] && enemyBullets[i].isOffScreen()) {
      enemyBullets.splice(i, 1);
    }
  }
    // Update and display enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBullets[i].update();
      enemyBullets[i].display();
      // Check for collisions with player
      if (player.checkCollision(enemyBullets[i])) {
        // If shield powerup is active, just remove the bullet
        if (player.powerupActive && player.powerupType === 0) {
          createExplosion(enemyBullets[i].x, enemyBullets[i].y, 10, [0, 100, 255]);
          enemyBullets.splice(i, 1);
          continue;
        }
        // Otherwise, lose a life
        lives--;
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, 30, [255, 255, 255]);
        explosionSound.play();
        enemyBullets.splice(i, 1);
        
        if (lives <= 0) {
          gameOver = true;
          // Save score to leaderboard if high enough
          checkAndSaveHighScore();
        }
        continue;
      }
      // Remove enemy bullets that go off screen
      if (enemyBullets[i].isOffScreen()) {
        enemyBullets.splice(i, 1);
      }
    }
    // Update particles
    updateParticles();
    // Display score and lives
    displayHUD();
  }