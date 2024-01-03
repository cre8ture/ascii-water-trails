var main;

var particle;
var lastReplenish = 0;
var replenishInterval = 2000; // 2 seconds

function setup() {
    createCanvas(windowWidth, windowHeight);
	background(255);
    particle = new Particle();

	main = makeGrid(windowWidth, windowHeight, 40);
}

function draw() {
	background(255); // 25 for slight trail fade

   

	fill(0);
	ellipse(mouseX, mouseY, 20, 20);
	textSize(20);
	

	main.forEach(elem => {
		elem.update();
		elem.draw(50);
	});

	particle.update();
    particle.draw();

    // Check for replenishing the trail
    if (millis() - lastReplenish > replenishInterval) {
        particle.replenish();

        lastReplenish = millis();
        replenishInterval = random(1000, 3000); // Randomize next interval
    }
}

function mouseDragged () {
	burst();
}

function mousePressed () {
	burst();
}

function burst () {
var mouse = new Posn(mouseX, mouseY);
	main.forEach(elem => {
		//elem.applyForce(elem.pos.offset(mouse).mul(0.00001).mul(elem.pos.dist(mouse) * 0.1));
		//elem.applyForce(elem.pos.offset(mouse).mul(0.01).mul(elem.pos.dist(mouse) * -0.01));
		elem.applyForce(elem.pos.offset(mouse).mul(pow(2, -(elem.pos.dist(mouse) * 0.04))));
	});
}

function burstParticle (x,y) {
	var particle = new Posn(x, y);
		main.forEach(elem => {
			//elem.applyForce(elem.pos.offset(mouse).mul(0.00001).mul(elem.pos.dist(mouse) * 0.1));
			//elem.applyForce(elem.pos.offset(mouse).mul(0.01).mul(elem.pos.dist(mouse) * -0.01));
			elem.applyForce(elem.pos.offset(particle).mul(pow(2, -(elem.pos.dist(particle) * 0.19))));
		});
	}



function makeGrid(width, height, blockSize) {
    var arr = [];
    var noiseScale = 0.1;

    for (var i = blockSize; i < width; i += blockSize) {
        for (var j = blockSize; j < height; j += blockSize) {
            var offset = (i / blockSize) % 2 === 0 ? 0 : blockSize / 2;
            var x = i;
            var y = j + offset;
            var heightValue = noise(x * noiseScale, y * noiseScale) * 100;
            arr.push(new Point(x, y, Math.random().toString(20)[3], 1, heightValue));
        }
    }

    return arr;
}
function Particle() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(2); // Increased velocity
    this.history = [];

    this.update = () => {
        this.vel.rotate(random(-0.1, 0.1)); // Smoother direction change
        this.pos.add(this.vel);

        // Boundary check
        if (this.pos.x > width || this.pos.x < 0) {
            this.vel.x *= -1;
        }
        if (this.pos.y > height || this.pos.y < 0) {
            this.vel.y *= -1;
        }

        this.history.push(this.pos.copy());
        if (this.history.length > 225) {
            this.history.splice(0, 1);
        }
    };
	 let i = 0
	 let eventHorizon

    this.draw = () => {
        for ( i = 1; i < this.history.length; i++) {
            let current = this.history[i];
            let previous = this.history[i - 1];
			if(this.history.length > 5 && i >= 2){
				eventHorizon = this.history[i - 2];
				burstParticle(eventHorizon.x, eventHorizon.y)
			}

            let opacity = map(i, 0, this.history.length, 50, 0); // Fade out the trail
			if (i / 3 )
            strokeWeight(i / 3);
            // strokeWeight(strokeWt === 100? 0 : strokeWt++);

            stroke(0, opacity);
            line(previous.x, previous.y, current.x, current.y);
			

        }
    };

    this.replenish = () => {
        // this.history = [];
    };
}



function Point(x, y, letter, mass, height) {
    this.supposed = new Posn(x, y);
    this.height = height;
	// this.pos = new Posn(x, y);
    this.pos = new Posn(x, y-height);

	this.vel = new Posn(0, 0);
	this.acc = new Posn(0, 0);
	this.lettering = letter != null;
	this.letter = letter;
	this.mass = mass == null ? 1 : mass;
	
	this.draw = (size) => {
		if (this.lettering) {
			text(this.letter, this.pos.x, this.pos.y);
		} 
	
	};
	
	this.update = () => { // should draw, update position, tell if clicked, etc, etc,
		this.applyForce(new Posn(random(-0.01, 0.01), random(-0.01, 0.01)));
		this.seek(this.supposed);
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.vel.mul(0.95); // friction
		this.acc.mul(0); //clear acc
	};
	
	this.seek = (target) => {
		this.applyForce(this.pos.offset(target).mul(this.pos.dist(target)).mul(-0.0001));
	};
	
	this.applyForce = (force) => {
		this.acc.add(force);
	}
	
	this.click = (mousePos) => { // click (posn) -> void
		
	};
}

function Posn (x, y) {
	this.x = x;
	this.y = y;
	
	this.get = () => {
		return new Posn(this.x, this.y);
	};
	
	this.apply = (f) => {
		this.x = f(this.x);
		this.y = f(this.y);
		
		return new Posn(this.x, this.y);
	}
	
	this.add = (other) => {
		this.x += other.x;
		this.y += other.y;
		
		return this.get();
	};
	
	this.mul = (c) => {
		this.x *= c;
		this.y *= c;
		
		return this.get();
	}
	
	this.offset = (other) => {
		return new Posn(this.x - other.x, this.y - other.y);
	}
	
	this.dist = (other) => {
		return sqrt(sq(other.x - this.x) + sq(other.y - this.y));
	}
}