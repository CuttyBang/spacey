$(document).ready(function(){
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    var canvas = new fabric.Canvas('screen',{
        hoverCursor: 'pointer',
        selection: false,
        width: WIDTH,
        height: HEIGHT
    });
/*
    var sunImg = document.getElementById('#sun');
    var imgInst= new fabric.Image(sunImg, {
      left: planet.x,
      top: planet.y,
      opacity: 0.95,
      width: 40,
      height: 40,
      hasBorders: false,
      hasControls: false
    });
    canvas.add(imgInst);
*/
    var getRandomInt = fabric.util.getRandomInt;

    $('.info').hide();

    window.setTimeout(function(){
      $('#modal').modal('show');
      //$('.info').toggle("slide");
    }, 1000);


    Physics(function(world) {

        var viewportBounds = Physics.aabb(-200, -200, WIDTH + 200, HEIGHT + 200);

        var edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.5,
            cof: 0.8
        });

        var attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.01
        });

        var renderer = Physics.renderer('canvas', {
            el: 'screen',
            height: HEIGHT,
            width: WIDTH
        });
        world.add(renderer);

        var planet = Physics.body('circle', {
            x: renderer.width / 2,
            y: renderer.height / 2,
            radius: 40,
            mass: 50,
            vx: 0.00001,
            vy: 0,
            styles: {
              //src: '..img/sun.png',
              fillStyle: '#ffca0d',
              angleIndicator: false
            }
        });
        //#223a8f original planet color
        planet.treatment = 'kinematic';
        planet.sleep(true);
        world.add(planet);


        var options;
        var distances = [];
        var distList = [];
        var bodies = [];
        var asteroidColors = ['#22feac', '#dae6eb', '#e4d9d7', '#8f9779', '#c1be77'];
        //var startPoint = renderer.height / 2 -240
        //240px = .2 vx
        //140px = .25vx

        var Options = function(){
          this.mass = 5;
          this.radius = this.mass * 1.2;
          this.orbit = renderer.height/2 - 20 ;
          this.velocity = 0.2;
        };

        window.onload = function(){
          options = new Options();
          var gui = new dat.GUI();
          gui.add(options, 'mass', 1, 10);
        };


        function asteroid(){
            var orbit = (options.mass * 20) + 20;
            var startPoints = [];
            var a = Physics.body('circle', {
                x: renderer.width / 2, //-20,
                y: renderer.height / 2 - orbit, //getRandomInt(-20, HEIGHT + 20),
                radius: options.mass * 2,
                mass: options.mass,
                vx: 0.45,
                styles: {
                    fillStyle: asteroidColors[getRandomInt(0, 4)],
                    angleIndicator: false
                }
            });
            world.add(a);
            a.treatment = 'dynamic';
            bodies.push(a);
            var l = new Array;
            distList.push(l);
        }


        function sound(ast, posIndex){

            var mPos = {
            x: ast.state.pos.get(0),
            y: ast.state.pos.get(1)
            };

            var planetPos = {
            x: planet.state.pos.get(0),
            y: planet.state.pos.get(1)
            };

                    var horzDist = Math.abs(planetPos.x - mPos.x);
                    var vertDist = Math.abs(planetPos.y - mPos.y);


                    var distance = Math.sqrt(Math.pow(horzDist,2) + Math.pow(vertDist,2));

                    var j = distList[posIndex];
                    j.push(Math.round(distance));

            if (distance <= 450) {
                if (j[j.length - 1] < j[j.length - 2]){
                   gains[posIndex].gain.value = Math.min(1, gains[posIndex].gain.value + (1 / Math.round(distance)));
                   vGain.gain.value = Math.min(1, vGain.gain.value + (1 / Math.round(distance)));
                   //console.log(vGain.gain.value);
                }
                if (j[j.length - 1] > j[j.length - 2]){
                    gains[posIndex].gain.value = Math.max(0, gains[posIndex].gain.value - (1 / Math.round(distance)));
                    vGain.gain.value = Math.max(0.3, vGain.gain.value - (0.7 / Math.round(distance)));
                    //console.log(vGain.gain.value);
                }
            }
            if (distance <= 350) {
                if (j[j.length - 1] < j[j.length - 2]){
                   filters[posIndex].frequency.value = Math.min(8000, filters[posIndex].frequency.value + (3950/ Math.round(distance)));
                   filters[posIndex].Q.value = Math.min(20, filters[posIndex].Q.value + (20/ Math.round(distance)));
                   //console.log(filters[posIndex].frequency.value);
                }
                if (j[j.length - 1] > j[j.length - 2]){
                   filters[posIndex].frequency.value = Math.max(50, filters[posIndex].frequency.value - (3950/ Math.round(distance)));
                   filters[posIndex].Q.value = Math.max(0, filters[posIndex].Q.value - (20 / Math.round(distance)));
                   //console.log(filters[posIndex].frequency.value);
                }
            }
            if (distance > 450) {
                filters[posIndex].frequency.value = 50;
                filters[posIndex].Q.value = 0.0;
            }
            if (distance > 550) {
                gains[posIndex].gain.value = 0.0;
                vGain.gain.value = 0.3;
            }
        }

        Array.prototype.remove = function(index){
          this.splice(index, 1);
        };

        var oscFactory = function(){
        	var o = context.createOscillator();
        	o.type = 'triangle';
        	o.frequency.value = scale[Math.floor(options.mass-1)];
        	var k = context.createGain();
        	k.gain.value = 0.0;
        	var filter = context.createBiquadFilter();
        	filter.type = 'lowpass';
        	filter.frequency.value = 50;
        	filter.Q.value = 0;
        	var distortion = context.createWaveShaper();
        	distortion.curve = distCurve(10);
        	distortion.oversample = '4x';

        	o.connect(k);
        	k.connect(distortion);
        	distortion.connect(filter);
        	filter.connect(boost);
        	//oscillator->gain->distortion->lpfilter->boost(gain/sends)

        	o.start(0);
        	filters.push(filter);
        	gains.push(k);
        	oscillators.push(o);
        };


        function killIt(){
          filters.shift();
          distList.shift();
          dec(gains.shift(), 1);
          end(oscillators.shift(), 2);
        }

        $(document).on('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);

        $(document).keyup(function(e){
          if (e.keyCode === 32){
              e.preventDefault();
              oscFactory();
              asteroid();
          }
          if(e.keyCode === 80){
              e.preventDefault();
              world.removeBody(bodies.shift());
              killIt();
          }
          if (e.keyCode === 81){
            if(master.gain.value === 0){
              master.gain.value = 1;
            }else{
              master.gain.value = 0;
            }
          }
        });

        world.on('step', function () {
            world.render();
            for (var i = 0; i<bodies.length; i++){
              sound(bodies[i], i);
            }
        });

        world.on({
            'interact:poke': function(pos){
                world.wakeUpAll();
                planet.sleep(true);
                attractor.position(pos);
                world.add(attractor);
            },
            'interact:move': function(pos){
                attractor.position(pos);
            },
            'interact:release': function(){
                planet.sleep(true);
                world.remove(attractor);
            }
        });

        world.add([
            Physics.behavior('interactive', { el: renderer.container }),
            Physics.behavior('newtonian', { strength: 0.5 }),
            Physics.behavior('body-impulse-response'),
            edgeBounce
        ]);

        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });

    });


});
