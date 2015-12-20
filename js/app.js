$(document).ready(function(){
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

	var getRandomInt = fabric.util.getRandomInt,
		WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight,
		moons = [];



	var canvas = new fabric.Canvas('screen',{
		hoverCursor: 'pointer',
		selection: false,
		backgroundColor: '#000',
		width: WIDTH,
		height: HEIGHT,
		perPixelTargetFind: true,
		targetFindToTolerance: 5
	});

	var planet = new fabric.Circle({
		radius: 50,
		fill: '#223a8f',
		left: canvas.getWidth() / 2,
		top: canvas.getHeight() / 2,
		originX: 'center',
		originY: 'center',
		hasBorders: false,
		hasControls: false
	});

	var sat = new fabric.Circle({
		radius: 15,
		left: 200,
		top: 100,
		selectable: false,
		originY: 'center',
		originX: 'center',
		fill: '#22feac'
	});



	var animateOrbit = function(p){
		var radius = p.radius * 5 + 100,
			cx = planet.left,
			cy = planet.top,
			duration = p.radius * 100, 
			startAngle = getRandomInt(-180, 0),
			endAngle = startAngle + 359;
		(function animate() {
			fabric.util.animate({
				startValue: startAngle,
				endValue: endAngle,
				duration: duration,
				easing: function (t, b, c, d) {
						return c*t/d + b;
						},
				onChange: function(angle){
					angle = fabric.util.degreesToRadians(angle);
					var x = cx + radius * Math.cos(angle);
					var y = cy + radius * Math.sin(angle);
					p.set({left: x, top: y}).setCoords();
					canvas.renderAll();
				},
				onComplete: animate,
			})
		})();

	};
	var ball = {
		x: canvas.getWidth() / 2,
		y: canvas.getHeight() / 2,
		vx: 9,
		vy: 5,
		radius: 20
	};

	var comet = new fabric.Circle({
		radius: ball.radius,
		left: ball.x,
		top: ball.y,
		fill: '#22feac'
	});
	
	function fly(){
		canvas.add(comet);
		(function animate(){
			comet.left += ball.vx;
			comet.top += ball.vy;
			if (comet.top + ball.vy > (HEIGHT + 90)){
				comet.fill = "#6e7f80";
				play1();
				ball.vy = -ball.vy;
			}
			if (comet.top + ball.vy < (0 - 90)){
				comet.fill = "#f1f2c6"
				play3();
				ball.vy = -ball.vy;
			}
			if (comet.left + ball.vy > (WIDTH + 90)){
				comet.fill = "#97a18d"
				play2();
				ball.vx = -ball.vx
			}
			if (comet.left + ball.vy < (0 - 90)){
				comet.fill = "#ffb745"
				play4();
				ball.vx = -ball.vx
			}
			canvas.renderAll();
			fabric.util.requestAnimFrame(animate);
		})();

	}

	var createMoon = function(){
		var planetColor = ['#22feac', '#aaddf1', '#ea9dcf', '#eaf'];
			var moonSize = getRandomInt(5, 40);
			var m = new fabric.Circle({
				radius: moonSize,
				fill: planetColor[getRandomInt(0, 3)],

				originX: 'center',
				originY: 'center'
			});

			m.hasControls = m.hasBorders = false;

			//moons.push(m);
			//createLine(m.x, m.y, planet.x, planet.y);
			animateOrbit(m);
			return m;
	}


	var createLine = function(c){
		return new fabric.Line(c, {
			fill: '',
			stroke: '#888',
			strokeWidth: 1,
			selectable: false,
			x1: planet.left,
			y1: planet.top,
			x2: createMoon.x,
			y2: createMoon.y

		});
	}

	function follow(){
			planet.setCoords(planet.getLeft());
			planet.setCoords(planet.getTop());
			canvas.add(createMoon());
	}

	//fly();
	canvas.add(planet);
	canvas.on({
		'mouse:down': follow
	});






});






