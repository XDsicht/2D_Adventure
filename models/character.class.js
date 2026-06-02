class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;
  x = 120;

  releaseArrow = false;
  shootingTime = 0;
  checkAlreadyRunning = false;
  characterJumping = false;
  currentDirection;
  attackDelay = false;
  pendingDamage = 0;
  damageFromAttackers = new Set();

  offset = {
    top: 35,
    left: 90,
    right: 78,
    bottom: 20,
  };

  characterSounds = {
    isAttackingSound: new Audio("audio/character_audio/character_arrow_shooting_sound.mp3"),
    isWalkingSound: new Audio("audio/character_audio/character_walking_sound.mp3"),
    isJumpingSound: new Audio("audio/character_audio/character_jumping_sound.mp3"),
    isHurtSound: new Audio("audio/character_audio/character_hurt_sound.mp3"),
    isDeadSound: new Audio("audio/character_audio/character_dead_sound.mp3"),
  };

  IMAGES_IDLE = [
    "img/2.character/1.idle/Warrior_03__IDLE_000.png",
    "img/2.character/1.idle/Warrior_03__IDLE_001.png",
    "img/2.character/1.idle/Warrior_03__IDLE_002.png",
    "img/2.character/1.idle/Warrior_03__IDLE_003.png",
    "img/2.character/1.idle/Warrior_03__IDLE_004.png",
    "img/2.character/1.idle/Warrior_03__IDLE_005.png",
    "img/2.character/1.idle/Warrior_03__IDLE_006.png",
    "img/2.character/1.idle/Warrior_03__IDLE_007.png",
    "img/2.character/1.idle/Warrior_03__IDLE_008.png",
    "img/2.character/1.idle/Warrior_03__IDLE_009.png",
  ];

  IMAGES_WALKING = [
    "img/2.character/2.walk/Warrior_03__WALK_000.png",
    "img/2.character/2.walk/Warrior_03__WALK_001.png",
    "img/2.character/2.walk/Warrior_03__WALK_002.png",
    "img/2.character/2.walk/Warrior_03__WALK_003.png",
    "img/2.character/2.walk/Warrior_03__WALK_004.png",
    "img/2.character/2.walk/Warrior_03__WALK_005.png",
    "img/2.character/2.walk/Warrior_03__WALK_006.png",
    "img/2.character/2.walk/Warrior_03__WALK_007.png",
    "img/2.character/2.walk/Warrior_03__WALK_008.png",
    "img/2.character/2.walk/Warrior_03__WALK_009.png",
  ];

  IMAGES_JUMPING = [
    "img/2.character/4.jump/Warrior_03__JUMP_000.png",
    "img/2.character/4.jump/Warrior_03__JUMP_001.png",
    "img/2.character/4.jump/Warrior_03__JUMP_002.png",
    "img/2.character/4.jump/Warrior_03__JUMP_003.png",
    "img/2.character/4.jump/Warrior_03__JUMP_004.png",
    "img/2.character/4.jump/Warrior_03__JUMP_005.png",
    "img/2.character/4.jump/Warrior_03__JUMP_006.png",
    "img/2.character/4.jump/Warrior_03__JUMP_007.png",
    "img/2.character/4.jump/Warrior_03__JUMP_008.png",
    "img/2.character/4.jump/Warrior_03__JUMP_009.png",
  ];

  IMAGES_HURT = [
    "img/2.character/6.hurt/Warrior_03__HURT_000.png",
    "img/2.character/6.hurt/Warrior_03__HURT_001.png",
    "img/2.character/6.hurt/Warrior_03__HURT_002.png",
    "img/2.character/6.hurt/Warrior_03__HURT_003.png",
    "img/2.character/6.hurt/Warrior_03__HURT_004.png",
    "img/2.character/6.hurt/Warrior_03__HURT_005.png",
    "img/2.character/6.hurt/Warrior_03__HURT_006.png",
    "img/2.character/6.hurt/Warrior_03__HURT_007.png",
    "img/2.character/6.hurt/Warrior_03__HURT_008.png",
    "img/2.character/6.hurt/Warrior_03__HURT_009.png",
  ];

  IMAGES_DEAD = [
    "img/2.character/7.dead/Warrior_03__DIE_000.png",
    "img/2.character/7.dead/Warrior_03__DIE_001.png",
    "img/2.character/7.dead/Warrior_03__DIE_002.png",
    "img/2.character/7.dead/Warrior_03__DIE_003.png",
    "img/2.character/7.dead/Warrior_03__DIE_004.png",
    "img/2.character/7.dead/Warrior_03__DIE_005.png",
    "img/2.character/7.dead/Warrior_03__DIE_006.png",
    "img/2.character/7.dead/Warrior_03__DIE_007.png",
    "img/2.character/7.dead/Warrior_03__DIE_008.png",
    "img/2.character/7.dead/Warrior_03__DIE_009.png",
  ];

  IMAGES_ATTACKING = [
    "img/2.character/5.attack/Warrior_03__ATTACK_000.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_001.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_002.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_003.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_004.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_005.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_006.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_007.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_008.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_009.png",
  ];

  world;

  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadCharacterImages();
    this.animate();
    this.applyGravity();
    this.registerCharacterSounds();
  }

  loadCharacterImages() {
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_IDLE);
  }

  registerCharacterSounds() {
    registerGameSound(this.characterSounds.isAttackingSound);
    registerGameSound(this.characterSounds.isWalkingSound);
    registerGameSound(this.characterSounds.isJumpingSound);
    registerGameSound(this.characterSounds.isHurtSound);
    registerGameSound(this.characterSounds.isDeadSound);
  }

  animate() {
    this.characterMovementAnimationIntervals();
    this.characterActionsIntervals();
    this.characterAttackAnimationIntervals();
  }

  characterActionsIntervals() {
    if (!this.dead || !this.isHurt()) {
      let actions = this.characterActions();
      let attack = this.characterAttack();
    }
  }

  characterAttack() {
    registerInterval(
      setInterval(() => {
        if (this.world.keyboard.D && this.shotAllowed() && !this.isAttacking && this.world.quiver.percentage > 0 && !this.dead) {
          this.activateDKey();
          this.resetAttackDelayTimer();
        }
      }, 100),
    );
  }

  characterActions() {
    let movements = registerInterval(
      setInterval(() => {
        this.resetMovementStatus();
        this.getMovements();
        this.disableMovements(movements);
      }, 1000 / 60),
    );
  }

  resetMovementStatus() {
    if (!this.isAboveGround()) {
      this.isWalking = false;
      this.characterJumping = false;
      this.characterSounds.isWalkingSound.pause();
      this.characterSounds.isJumpingSound.pause();
    }
  }

  getMovements() {
    if (!this.isAttacking && !this.attackDelay) {
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.executeMoveRight();
      }
      if (this.world.keyboard.LEFT && this.x > 0) {
        this.executeMoveLeft();
      }
      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.executeJump();
      }
    }
  }

  executeMoveRight() {
    this.moveRight();
    this.otherDirection = false;
    this.isWalking = true;
    this.playWalkingSound();
  }

  executeMoveLeft() {
    this.moveLeft();
    this.otherDirection = true;
    this.isWalking = true;
    this.playWalkingSound();
  }

  executeJump() {
    this.characterJumping = true;
    this.isWalking = false;
    this.resetCurrentImage();
    this.jump();
    this.characterSounds.isWalkingSound.pause();
    playSound(this.characterSounds.isJumpingSound, gameSoundsVolume);
  }

  disableMovements(movements) {
    if (this.isDead() && !this.dead) {
      this.resetCurrentImage();
      clearInterval(movements);
      this.playDeadSound();
      return (this.dead = true);
    }
  }

  playDeadSound() {
    this.characterSounds.isDeadSound.currentTime = 0;
    playSound(this.characterSounds.isDeadSound, gameSoundsVolume);
  }

  activateDKey() {
    if (!this.isAttacking) {
      this.resetCurrentImage();
      this.isAttacking = true;
      this.playAttackingSound();
      this.world.keyboard.D = true;
      this.currentDirection = this.otherDirection;
      this.attackDelay = true;
      this.resetAttackVariables();
    }
  }

  playAttackingSound() {
    this.characterSounds.isAttackingSound.currentTime = 0;
    playSound(this.characterSounds.isAttackingSound, gameSoundsVolume);
  }

  resetAttackDelayTimer() {
    setTimeout(() => {
      this.attackDelay = false;
    }, 400);
  }

  resetAttackVariables() {
    setTimeout(() => {
      this.isAttacking = false;
      this.world.keyboard.D = false;
      this.releaseArrow = true;
    }, 300);
  }

  characterMovementAnimationIntervals() {
    registerInterval(
      setInterval(() => {
        if (this.isAttacking) return;
        return this.executeMovementAnimations();
      }, 1000 / 10),
    );
  }

  executeMovementAnimations() {
    if (this.dead) {
      this.executeDeathAnimation();
    } else if (this.isHurt()) {
      this.executeHurtAnimation();
    } else if (this.isAboveGround()) {
      this.executeJumpAnimation();
    } else if (this.isWalking) {
      this.playAnimation(this.IMAGES_WALKING);
    } else {
      this.playAnimation(this.IMAGES_IDLE);
    }
  }

  executeDeathAnimation() {
    if (this.currentImage < this.IMAGES_DEAD.length - 1) {
      this.playAnimation(this.IMAGES_DEAD);
    } else {
      this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
    }
  }

  executeHurtAnimation() {
    this.playHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  executeJumpAnimation() {
    this.characterJumping = true;
    this.playAnimation(this.IMAGES_JUMPING);
    if (this.currentImage === this.IMAGES_JUMPING.length - 1 || !this.isAboveGround()) {
      this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
    }
  }

  playHurtSound() {
    if (this.currentImage === 0) {
      this.characterSounds.isHurtSound.currentTime = 0;
      playSound(this.characterSounds.isHurtSound, gameSoundsVolume);
    }
  }

  characterAttackAnimationIntervals() {
    registerInterval(
      setInterval(() => {
        if (this.isAttacking) {
          this.playAnimation(this.IMAGES_ATTACKING);
        }
      }, 30),
    );
  }

  shotAllowed() {
    let timePassed = new Date().getTime() - this.shootingTime;
    timePassed = timePassed / 1000;
    return timePassed > 0.2;
  }

  isEncounteringObstacle(enemy) {
    const offset = this.getDirectionalOffset(enemy);

    return this.x + this.width - offset.thisRight > enemy.x + offset.moRight - 15 && this.x + offset.thisLeft < enemy.x + enemy.width - offset.moLeft;
  }

  isEncounteringEndboss(endboss) {
    const offset = this.getDirectionalOffset(endboss);
    return this.x + this.width - offset.thisRight > endboss.x + offset.moRight * 0.99 && this.x + offset.thisLeft * 0.99 < endboss.x + endboss.width - offset.moLeft;
  }

  isCollidingVertically(mo) {
    const offset = this.getDirectionalOffset(mo);
    return (
      this.x + offset.thisLeft < mo.x + mo.width - offset.moRight &&
      this.y + this.height - this.offset.bottom < mo.y + mo.height - mo.offset.bottom &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.width - offset.thisRight > mo.x + offset.moLeft &&
      this.speedY < 0
    );
  }

  isHit(damage = 20) {
    this.energy -= damage;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
      this.resetCurrentImage();
    }
  }

  addPendingDamage(attacker, damage = 20) {
    if (!this.damageFromAttackers.has(attacker)) {
      this.pendingDamage += damage;
      this.damageFromAttackers.add(attacker);
    }
  }

  applyAccumulatedDamage() {
    if (this.pendingDamage > 0) {
      this.isHit(this.pendingDamage);
      this.pendingDamage = 0;
      this.damageFromAttackers.clear();
    }
  }

  resetDamageAccumulation() {
    this.pendingDamage = 0;
    this.damageFromAttackers.clear();
  }

  playWalkingSound() {
    if (!this.isAboveGround()) {
      playSound(this.characterSounds.isWalkingSound, gameSoundsVolume);
    } else {
      this.characterSounds.isWalkingSound.pause();
    }
  }
}
