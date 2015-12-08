$(document).ready(function(){
	
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

	var getRandomInt = fabric.util.getRandomInt;
	
	var canvas = new fabric.Canvas('screen');



	var planet = new fabric.Circle({
		radius: 100,
		fill: '#223a8f',
		stroke: '#000',
		strkeWidth: 3,
		left: canvas.getWidth() / 2,
		top: canvas.getHeight() / 2
	});

	var sat = new fabric.Circle({
		radius: 20,
		left: 200,
		top: 100,
		fill: '#f56ea2'
	});


	for (var i = 1000; i >= 0; i--) {
		var star = new fabric.Circle({
			left: getRandomInt(0, 1400),
			top: getRandomInt(0, 1000),
			radius: 1,
			fill: '#fff'
		});
		canvas.add(star);
	};

	canvas.add(planet, sat);
	createOrbit(sat.radius);
	animateSat(sat);


	function createOrbit(i){
		var orbit = new fabric.Circle({
			radius: 10 * i + 90,
			left: canvas.getWidth() / 2,
			top: canvas.getHeight() / 2,
			fill: '',
			stroke: ('#333'),
			hasBorders: false,
			hasControls: false,
			lockMovementX: true,
			lockMovementY: true
		});
		canvas.add(orbit);
	};

	function animateSat(p){
		var radius = sat.radius * 10 + 90,
			cx = canvas.getWidth() / 2,
			cy = canvas.getHeight() / 2,
			duration = 2000,
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

					var x = cx + radius* Math.cos(angle);
					var y = cy + radius * Math.sin(angle);

					p.set({left: x, top: y}).setCoords();

					canvas.renderAll();
				},
				onComplete: animate
			})
		})();
	};

	//rect.set({left: 20, top: 50});
	//canvas.renderAll();



































});






