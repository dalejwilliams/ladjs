/*
	LAD.js DEMO: SHAPESHIPS
	-----------------------
	Copyright (c) 2012, Dale J Williams
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
		* Redistributions of source code must retain the above copyright
		  notice, this list of conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright
		  notice, this list of conditions and the following disclaimer in the
		  documentation and/or other materials provided with the distribution.
		* Neither the name of the author nor the names of any contributors may 
		  be used to endorse or promote products derived from this software 
		  without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

"use strict"; 

var SS = {};

SS.Game = LAD.Game.extend({
	init: function(canvasName) {
		this.uber(canvasName, 30);
		this.hud = new SS.HUD(this);	
		this.keys = {
			up: 87, // W
			left: 65, // A
			down: 83, // S
			right: 68, // D
			shootUp: 38, // UP
			shootDown: 40, // DOWN
			shootLeft: 37, // LEFT
			shootRight: 39, // RIGHT
			shootStraight: 32, //SPACE
			confirm: 13, // ENTER
		};
		this.mouse = {
			shoot: 0
		};
		this.input = new SS.Input();
		this.wave = new SS.Wave();
		this.score = new SS.Score();
		this.setScene(new SS.TitleScreen());
	}
});

SS.Input = LAD.MultiInput.extend({	
	init: function(player) {
		this.uber();
		this.player = player;
	},
	getMoveAngle: function() {
		return this.getAngle("left", "up", "right", "down");
	},
	getShootAngle: function() {
		if (this.isPressed("shoot")) {
			return this.getAngle("shootLeft", "shootUp", "shootRight", "shootDown");
		} else {
			var t = this.player.renderTransform;
			var dx = this.mouse.x - t.x;
			var dy = this.mouse.y - t.y;
			return Math.atan2(dy, dx);
		}
	},
	getAngle: function(leftName, upName, rightName, downName) {
		var left = this.isPressed(leftName),
			up = this.isPressed(upName),
			right = this.isPressed(rightName),
			down = this.isPressed(downName);
		if (up && left) return Math.PI * -0.75;
		if (up && right) return Math.PI * -0.25;
		if (down && left) return Math.PI * 0.75;
		if (down && right) return Math.PI * 0.25;
		if (up) return Math.PI * -0.5;
		if (down) return Math.PI * 0.5;
		if (left) return Math.PI;
		if (right) return 0;
		return NaN;
	},
});

SS.Score = LAD.Class.extend({
	init: function() {
		this.reset();
	},
	reset: function() {
		this.score = 0;
		this.multi = 1;
		this.lives = 3;
	},
	increaseMulti: function() {
		this.multi++;
	}
});

SS.Wave = LAD.Class.extend({
	init: function() {
		this.reset();
	},
	reset: function() {
		this.setWave(1);
	},
	next: function() {
		this.setWave(this.wave + 1);
	},
	prev: function() {
		this.setWave(this.wave - 1);
	},
	again: function() {
		this.setWave(this.wave);
	},
	setWave: function(wave) {
		this.spawnFrames = this.getSpawnFrames();
		this.enemies = Math.floor(wave*0.5) + 3;
		this.enemiesSpawned = 0;
		this.enemiesKilled = 0;
		this.enemySpeed = 5 + (wave * 0.3);
		this.wave = wave;
		this.enemyTypes = this.getEnemyTypes();
	},
	getSpawnFrames: function() {
		var wave = this.wave;
		if (wave < 2) return 80;
		if (wave < 5) return 60;
		if (wave < 8) return 40;
		if (wave < 10) return 30;
		if (wave < 15) return 20;
		if (wave < 20) return 15;
		if (wave < 30) return 10;
		return 5;
	},
	getEnemyTypes: function() {
		var wave = this.wave;
		var result = [SS.BounceShip];
		if (wave > 3) result.push(SS.ChaserShip);
		return result;
	},
	getRandomEnemy: function() {
		return this.enemyTypes[Math.floor(Math.random()*this.enemyTypes.length)];
	},
	getSuccess: function() {
		var wave = this.wave;
		if (wave > 2) {
			var type;
			if (wave > 30) type = "IMPOSSIBLE";
			else if (wave > 20) type = "IMPROBABLE";
			else if (wave > 15) type = "AMAZING";
			else if (wave > 10) type = "GREAT";
			else if (wave > 8) type = "GOOD";
			else if (wave > 5) type = "DECENT";
			else if (wave > 5) type = "SOME";
			else type = "FLEETING";
			return "YOU LASTED " + (wave-1) + " WAVES - " + type + " SUCCESS!"
		} else if (wave == 2) {
			return "YOU MADE IT THROUGH A SINGLE WAVE";
		} else {
			return "YOU COULDN'T LAST A SINGLE WAVE";
		}
	}
});

SS.Grid = LAD.Entity.extend({
	init: function() {
		this.uber();
		var gridSize = 80;
		var cols = 15;
		var rows = 15;
		var odd = false;
		var width = gridSize * cols;
		var height = gridSize * rows;
		
		var p = new LAD.Path(null, "#ACE", 2);
		var a, b;
		var pos = gridSize;
		while (pos <= width) {
			odd = !odd;
			a = odd ? height : 0;
			b = odd ? 0 : height;
			p.add(pos, a);
			p.add(pos, b);
			pos += gridSize;
		}
		pos = height;
		while (pos > 0) {
			
			a = odd ? width : 0;
			b = odd ? 0 : width;
			p.add(a, pos);
			p.add(b, pos);
			pos -= gridSize;
			odd = !odd;
		}
		p.add(0, 0);
		p.add(width, 0);
		p.add(width, height);
		p.add(0, height);
		p.add(0, 0);
		p.closed = false;
		
		this.clip = p;
		this.width = width;
		this.height = height;
		this.gridSize = gridSize;
	}
});

SS.Ship = LAD.Entity.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.enemy = false;
		this.ship = true;
		this.move = new LAD.Point(0, -1);
		this.moveDelta = new LAD.Point(0, -1);
		this.origin = new LAD.Point();
		this.hitRadius = 20;
	},
	onCollision: function(e) {}
});

SS.Bullet = SS.Ship.extend({
	init: function() { 
		this.uber(); 
		this.move = new LAD.Point();
		this.hitRadius = 20;
		this.enemy = false;
		
		var p = new LAD.Path("#468");
		p.add(-5,-3);
		p.add(0, -7);
		p.add(5,-3);
		p.add(5, 5);
		p.add(-5, 5);
		p.closed = true;
		this.clip = p;
	},
	go: function(angle, speed) {
		this.move.x = Math.cos(angle) * speed;
		this.move.y = Math.sin(angle) * speed;
		this.transform.rotation = angle + Math.PI * 0.5;
	},
	update: function() {
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		if (this.scene.isWithin(this)) return;
		this.scene.remove(this);
	},
	onCollision: function(e) {
		if (e == this.scene.ship) return;
		if (e.enemy == true) {
			this.scene.kill(e);
		}
	}
});

SS.PlayerShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 16;
		this.fireSpeed = 30;
		this.shootFrames = 4;
		this.smokeFrames = 4;
		this.hitRadius = 24;
		this.enemy = false;
		this.bullets = [];
		this.smokes = [];
	},
	awake: function() {
		this.input = this.game.input;
		this.input.keyboard.addActions(this.game.keys);
		this.input.keyboard.addActions(this.game.mouse);
		this.input.player = this;
		this.draw();
	},
	draw: function() {
		var s = new LAD.Group();
	
		var p = new LAD.Path("#DDA", "#999", 1);
		p.add(-16, 24);
		p.add(0, -24);
		p.add(16, 24);
		p.add(0, 18);
		p.add(-16, 24);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#FFF");
		p.add(-10, 12);
		p.add(-16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#FFF");
		p.add(10, 12);
		p.add(16, 24);
		p.add(0,0);
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#AAA");
		p.add(0, -24);
		p.add(-1, 24);
		p.add(1, 24);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	start: function() {
		this.reset();
	},
	reset: function() {
		this.transform.rotation = 0;
		this.move.x = 0;
		this.move.y = -1;
		this.moveDelta.x = 0;
		this.moveDelta.y = -1;
		this.frame = 0;
	},
	update: function() {
		var moveAngle = this.game.input.getMoveAngle();
		
		if (isNaN(moveAngle)) {
			this.moveDelta.setPosition(0, 0);
		} else {
			this.moveDelta.x = Math.cos(moveAngle) * this.speed;
			this.moveDelta.y = Math.sin(moveAngle) * this.speed;
		}
		this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
		this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
		
		var rot = this.origin.directionTo(this.move);
		this.transform.rotation = rot + Math.PI * 0.5;
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		
		this.scene.constrain(this);
		
		// shoot
		var shootAngle = this.game.input.isPressed("shootStraight") ? rot : this.game.input.getShootAngle();	
		if (shootAngle && !this.shootAngle) this.shootAngle = shootAngle;
		if (shootAngle && this.shootAngle) shootAngle = (shootAngle*7 + this.shootAngle) * 0.125;
		
		if (this.frame % this.shootFrames == 0 && !isNaN(shootAngle)) {
			if (this.shootAngle - shootAngle > Math.PI) this.shootAngle -= Math.PI * 2;
			this.shoot(shootAngle);
		}
		this.shootAngle = shootAngle;
		
		//smoke
		if (this.frame % this.smokeFrames == 0 && !isNaN(moveAngle)) this.smoke();
		
		this.frame++;
	},
	shoot: function(angle) {
		var bullet = this.bullets.length > 10 ? this.bullets.shift() : new SS.Bullet();
		bullet.transform.copy(this.prevTransform);
		bullet.go(angle, this.fireSpeed);
		if (!bullet.scene) this.scene.add(bullet, 1);
		this.bullets.push(bullet);
	},
	smoke: function() {
		var smoke = this.smokes.length > 8 ? this.smokes.shift() : new SS.SmokePart();
		smoke.go(this.transform.rotation + Math.PI * 0.5)
		smoke.transform.copy(this.prevTransform);
		if (!smoke.scene) this.scene.add(smoke, 1);
		this.smokes.push(smoke);
	}
});

SS.ChaserShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.hitRadius = 15;
		this.move = new LAD.Point(0, -1);
		this.moveDelta = new LAD.Point(0, -1);
		this.origin = new LAD.Point();
		this.enemy = true;
		this.draw();
	},
	draw: function() {
		var s = new LAD.Group();
		
		var p = new LAD.Path("#E44", 0, 0);
		var PI2 = Math.PI * 2;
		var ang = PI2;
		var seg = PI2 / 24;
		var rad = 20;
		var px, py;
		while (ang >= 0) {
			px = Math.cos(ang) * rad;
			py = Math.sin(ang) * rad;
			p.add(px, py);
			rad = rad == 20 ? 16 : 20;
			ang -= seg;
		}
		while (ang <= PI2) {
			px = Math.cos(ang) * rad;
			py = Math.sin(ang) * rad;
			p.add(px, py);
			rad = rad == 10 ? 8 : 10;
			ang += seg;
		}
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#666", 0, 0);
		p.add(0,10);
		p.add(10,0);
		p.add(0,-10);
		p.add(-10,0);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	update: function() {
		var target = this.scene.ship;
		var moveAngle = target.transform.directionTo(this.transform) + Math.PI;
		
		this.moveDelta.x = Math.cos(moveAngle) * this.speed;
		this.moveDelta.y = Math.sin(moveAngle) * this.speed;

		this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
		this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
		
		var rot = this.origin.directionTo(this.move);
		this.transform.rotation = rot + Math.PI * 0.5;
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		
		this.scene.constrain(this);
	},
	onCollision: function(e) {
		if (!this.scene) return;
		if (e == this.scene.ship) {
			this.scene.die();
			return;
		}
		if (e.enemy == true) {
			var r = e.transform.directionTo(this.transform);
			this.transform.x += Math.cos(r) * this.speed * 0.3;
			this.transform.y += Math.sin(r) * this.speed * 0.3;
		}
	}
});

SS.BounceShip = SS.Ship.extend({
	init: function() {
		this.uber();
		this.speed = 10;
		this.hitRadius = 15;
		this.move = new LAD.Point(0, -1);
		this.moveDelta = new LAD.Point(0, -1);
		this.origin = new LAD.Point();
		this.enemy = true;
		this.draw();
	},
	draw: function() {
		var s = new LAD.Group();
		
		var p = new LAD.Path("#44E", 0, 0);
		var PI2 = Math.PI * 2;
		var ang = PI2;
		var seg = ang / 6;
		var rad = 20;
		var px, py;
		while (ang >= 0) {
			px = Math.cos(ang) * rad;
			py = Math.sin(ang) * rad;
			p.add(px, py);
			rad = rad == 20 ? 16 : 20;
			ang -= seg;
		}
		while (ang <= PI2) {
			px = Math.cos(ang) * rad;
			py = Math.sin(ang) * rad;
			p.add(px, py);
			rad = rad == 10 ? 8 : 10;
			ang += seg;
		}
		p.closed = true;
		s.add(p);
		
		p = new LAD.Path("#999", 0, 0);
		p.addCircle(0,0,8);
		p.closed = true;
		s.add(p);
		
		this.clip = s;
	},
	start: function() {
		this.setRandomDirection();
	},
	update: function() {
		this.moveDelta.x = Math.cos(this.direction) * this.speed;
		this.moveDelta.y = Math.sin(this.direction) * this.speed;

		this.move.x = (this.move.x * 4 + this.moveDelta.x) * 0.2;
		this.move.y = (this.move.y * 4 + this.moveDelta.y) * 0.2;
		
		this.transform.rotation += 0.2;
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		
		if (this.scene.isWithin(this)) return;
		this.scene.constrain(this);
		this.setRandomDirection();
	},
	setRandomDirection: function() {
		this.direction = Math.floor(Math.random() * 4) * Math.PI * 0.5 + Math.PI * 0.25;
	},
	onCollision: function(e) {
		if (!this.scene) return;
		if (e == this.scene.ship) {
			this.scene.die();
			return;
		}
		if (e.enemy == true) {
			this.direction = e.transform.directionTo(this.transform);
		}
	}
});

SS.Explosion = LAD.Entity.extend({
	init: function(parts, speed){
		this.uber();
		this.parts = parts;
		this.speed = speed;
	},
	start: function(){
		var g = Math.floor(Math.random() * 150 + 30);
		var b = Math.floor(Math.random() * 150 + 100);
		if (!this.color) this.color = "rgb(125," + g + "," + b + ")";
		var part;
		var ang = Math.PI * 2;
		var seg = ang / this.parts;
		while (ang > 0) {
			part = new SS.ExplosionPart();
			if (!isNaN(this.life)) part.life = this.life;
			part.go(ang, this.speed, this.color);
			part.transform.x = this.transform.x;
			part.transform.y = this.transform.y;
			this.scene.add(part, 1);
			ang -= seg;
		}
		this.scene.remove(this);
	}
});

SS.ExplosionPart = LAD.Entity.extend({
	init: function() { 
		this.uber();
		
		this.magnetDistance = 150;
		
		var p = new LAD.Path();
		p.addCircle(0, 0, 4, 6);
		p.closed = true;
		this.clip = p;		
	},
	go: function(angle, speed, color) {		
		this.speed = speed;
		if (isNaN(this.life)) this.life = Math.random()*60+60;
		this.lived = 0;
		this.clip.fillColor = color;
		
		var px = Math.cos(angle);
		var py = Math.sin(angle);
		this.move = new LAD.Point(px, py);
		
		this.transform.rotation = angle;
		this.hitRadius = 5;
	},
	update: function() {
		if (this.magnetic && this.scene.state == "alive") {
			this.speed += 0.5;
			var ang = this.transform.directionTo(this.scene.ship.transform);
			this.move.setPosition(Math.cos(ang)*this.speed, Math.sin(ang)*this.speed);
		} else {
			if (this.scene.ship) this.magnetic = this.lived > 10 && this.transform.isWithinDistance(this.scene.ship.transform, this.magnetDistance);
			this.speed *= 0.95;
		}
		this.transform.x += this.move.x * this.speed;
		this.transform.y += this.move.y * this.speed;
		this.scene.constrain(this);
		if (this.lived++ < this.life) return;
		this.scene.remove(this);
	},
	onCollision: function (e) {
		if (!this.scene) return;
		if (e != this.scene.ship) return;
		this.game.score.increaseMulti();
		this.scene.remove(this);
	}
});

SS.SmokePart = LAD.Entity.extend({
	init: function() {
		this.uber();
		this.move = new LAD.Point();
		var alpha = Math.random()*0.3+0.2;
		var p = new LAD.Path("rgba(150,150,150,"+alpha+")");
		p.add(-15, 5);
		p.add(0, -8);
		p.add(15, 5);
		p.add(15, 8);
		p.add(0, -5);
		p.add(-15, 8);
		p.closed = true;
		this.clip = p;
	},
	go: function(rotation) { 
		var speed = 3;
		this.move.setPosition(Math.cos(rotation)*speed, Math.sin(rotation)*speed);
		this.transform.rotation = rotation - Math.PI * 0.5;
		this.life = 8;
	},
	start: function() {
		this.transform.x += this.move.x * 3;
		this.transform.y += this.move.y * 3;
	},
	update: function() {
		this.transform.x += this.move.x;
		this.transform.y += this.move.y;
		if (this.life-- > 0) return;
		this.scene.remove(this);
	}
});

SS.Scene = LAD.Scene.extend({
	init: function() {
		this.uber();
		
		this.grid = new SS.Grid();
		this.add(this.grid);
		
		this.ship = new SS.PlayerShip();
	},
	start: function() {
		this.restart();
	},
	update: function() {
		var t = this.transform;
		var r = this.game.renderer;
		t.x = (r.width * 0.5 - this.ship.transform.x - this.ship.move.x) / t.scale;
		t.y = (r.height * 0.5 - this.ship.transform.y - this.ship.move.y) / t.scale;
		if (t.x > 100) t.x = 100;
		if (t.y > 100) t.y = 100;
		var xmax = r.width - this.grid.width - 100;
		var ymax = r.height - this.grid.height - 100;
		if (t.x < xmax) t.x = xmax;
		if (t.y < ymax) t.y = ymax;
		
		this.frames++;
		
		// handle states
		switch (this.state) {
			case "alive":
				this.detectCollisions();
				this.updateSpawn();
				break;
			case "dead":
				this.updateDead();
				break;
		}
	},
	render: function(r) {
		this.game.hud.render(r, this.game.score.score, this.game.score.multi, this.game.wave.wave, this.game.score.lives);
	},
	restart: function() {
		this.respawn();
		this.frames = 0;
		this.game.score.reset();
		this.game.wave.reset();
	},
	respawn: function() {
		this.state = "alive";
		this.spawnPlayer();
		this.game.wave.again();
	},
	detectCollisions: function() {
		var ea, eb, hitDistance, i, j;
		var colliders = this.entities.slice();
		i = colliders.length;
		while (i-- > 0) {
			ea = colliders[i];
			j = i;
			while (j-- > 0) {
				eb = colliders[j];
				if (!ea.scene || !eb.scene) return;
				if (!ea.transform.isWithinDistance(eb.transform, ea.hitRadius + eb.hitRadius)) continue;
				ea.onCollision(eb);
				eb.onCollision(ea);
			}
		}
	},
	updateSpawn: function() {
		if (this.state == "dead") return;
		if (this.game.wave.enemiesKilled >= this.game.wave.enemies) {
			this.game.wave.next();
			return;
		}
		if (this.game.wave.enemiesSpawned >= this.game.wave.enemies) return;
		if (this.frames % this.game.wave.spawnFrames == 0) this.spawnEnemy();
	},
	updateDead: function() {
		if (this.deadFrames-- > 0) return;
		if (this.game.score.lives > 0) this.respawn();
		else this.game.setScene(new SS.EndScreen());
	},
	spawnPlayer: function() {
		if (this.state == "dead") return;
		this.add(this.ship);
		this.ship.reset();
		this.ship.transform.x = this.grid.width * 0.5;
		this.ship.transform.y = this.grid.height * 0.5;
	},
	spawnEnemy: function() {
		var p
		do {
			p = this.getRandomWallPosition();
		} while (p.isWithinDistance(this.ship, 200));
		
		var enemyType = this.game.wave.getRandomEnemy();
		var enemy = new enemyType();
		enemy.transform.setPosition(p.x, p.y);
		enemy.speed = this.game.wave.enemySpeed;
		this.add(enemy, 1);
		this.game.wave.enemiesSpawned++;
	},
	kill: function(e) {
		this.game.score.score += 100 * this.game.score.multi;
		this.explode(e);
		this.game.wave.enemiesKilled++;
	},
	explode: function(e) {
		var parts = Math.ceil(Math.random()*8)+4;
		var speed = 10;
		var explosion = new SS.Explosion(parts, speed);
		explosion.transform.x = e.transform.x;
		explosion.transform.y = e.transform.y;
		this.remove(e);
		this.add(explosion);
	},
	die: function() {
		if (this.state == "dead") return;
		for (var i = 1; i < this.entities.length; i++) {
			if (this.entities[i].ship != true) continue;
			this.explode(this.entities[i]);
		}
		this.state = "dead";
		this.deadFrames = 80;
		this.game.score.lives--;
	},
	getRandomWallPosition: function() {
		var p = new LAD.Point();
		if (Math.random() > 0.5) {
			p.x = Math.random() * this.grid.width;
			p.y = Math.random() > 0.5 ? 0 : this.grid.height;
		} else {
			p.y = Math.random() * this.grid.height;
			p.x = Math.random() > 0.5 ? 0 : this.grid.width;
		}
		return p;
	},
	constrain: function(e) {
		if (e.transform.x < 0) e.transform.x = 0;
		if (e.transform.y < 0) e.transform.y = 0;
		if (e.transform.x > this.grid.width) e.transform.x = this.grid.width;
		if (e.transform.y > this.grid.height) e.transform.y = this.grid.height;
	},
	isWithin: function(e) {
		return e.transform.x > 0 
			&& e.transform.y > 0 
			&& e.transform.x < this.grid.width 
			&& e.transform.y < this.grid.height;
	}
});

SS.HUD = LAD.Class.extend({
	init: function(game) {
		this.game = this;
	},
	render: function(r, score, multi, wave, lives) {
		if (this.score == score 
			&& this.wave == wave 
			&& this.lives == lives
			&& this.multi == multi) return;
			
		var w = r.width,
			h = r.height,
			c = r.context;
		
		// text
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "24px serif";
		c.textClassline = "bottom";
		c.textAlign = "left";
		c.strokeText("SCORE: " + score, 30, 50);
		c.strokeText("MULTI: " + multi + "x", w - 500, 50);
		c.strokeText("WAVE: " + wave, w - 300, 50);
		c.strokeText("LIVES: " + lives, w - 140, 50);
	}
});

SS.MenuScreen = LAD.Scene.extend({
	init: function(nextScreen) {
		this.uber();
		this.nextScreen = nextScreen;
	},
	start: function() {
		if (this.nextScreen) {
			this.handleInputBind = this.handleInput.bind(this);
			this.game.input.addListener(this.handleInputBind);
		}
	},
	handleInput: function() {
		console.log("handleInput");
		this.game.input.removeListener(this.handleInputBind);
		this.game.setScene(this.nextScreen);
	},
	update: function() {
		if (isNaN(this.frame)) this.frame = 1;
		if (this.frame-- > 0) return;
		var explosion = new SS.Explosion(16, 10),
			r = this.game.renderer;
		explosion.transform.x = Math.random() * r.width;
		explosion.transform.y = Math.random() * r.height;
		explosion.life = Math.random()*8+8;
		explosion.color = "#ACE";
		this.add(explosion);
		this.frame = NaN;
	},
	constrain: function(e) {}
})

SS.TitleScreen = SS.MenuScreen.extend({
	init: function() {
		this.uber(new SS.Scene());
	},
	update: function() {
		if (isNaN(this.frame)) this.frame = 1;
		if (this.frame-- > 0) return;
		var explosion = new SS.Explosion(16, 10),
			r = this.game.renderer;
		explosion.transform.x = Math.random() * r.width;
		explosion.transform.y = Math.random() * r.height;
		explosion.life = Math.random()*8+8;
		explosion.color = "#ACE";
		this.add(explosion);
		this.frame = NaN;
	},
	render: function(r) {
		this.uber(r);
		
		var w = r.width,
			h = r.height,
			c = r.context;
		
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "72px serif";
		c.textClassline = "bottom";
		c.textAlign = "center";
		c.strokeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		c.font = "28px serif";
		c.strokeText("A CANVAS POWERED SHOOTER", w * 0.5, h * 0.5 - 45);
		
		c.font = "32px serif";
		//c.strokeText("PLAY GAME", w * 0.5, h * 0.5 + 90);
		//c.strokeText("HIGH SCORES", w * 0.5, h * 0.5 + 140);
		c.strokeText("CLICK TO START", w * 0.5, h * 0.5 + 160);
		
		c.font = "14px serif";
		c.fillText("� 2012 DALE J WILLIAMS", w * 0.5, h - 25);
	}
});

SS.EndScreen = SS.MenuScreen.extend({
	init: function() {
		this.uber(new SS.TitleScreen());
	},
	render: function(r) {
		this.uber(r);
		
		var w = r.width,
			h = r.height,
			c = r.context;
		
		c.fillStyle = "#468";
		c.strokeStyle = "#234";
		c.font = "72px serif";
		c.textClassline = "bottom";
		c.textAlign = "center";
		c.strokeText("SHAPESHIPS", w * 0.5, h * 0.5 - 65);
		
		c.font = "24px serif";
		c.strokeText(this.game.wave.getSuccess(), w * 0.5, h * 0.5 + 70);
		c.font = "32px serif";
		c.strokeText("YOU GOT " + this.game.score.score + " POINTS", w * 0.5, h * 0.5 + 110);
		c.strokeText("AND A " + this.game.score.multi + "x MULTIPLIER", w * 0.5, h * 0.5 + 150);
		
		c.font = "14px serif";
		c.fillText("� 2012 DALE J WILLIAMS", w * 0.5, h - 25);
	}
});