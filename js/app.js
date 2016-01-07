$(document).ready(function(){
    //fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    var canvas = new fabric.Canvas('screen',{
        hoverCursor: 'pointer',
        selection: false,
        backgroundColor: '#000',
        width: WIDTH,
        height: HEIGHT
    });

    var getRandomInt = fabric.util.getRandomInt;

    Physics(function(world) {

        var viewportBounds = Physics.aabb(-200, -200, WIDTH + 200, HEIGHT + 200);

        var edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.5,
            cof: 0.8
        });

        var attractor = Physics.behavior('attractor', {
            order: 0,
            strength: .002
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
            mass: 20,
            vx: 0.00001,
            vy: 0,
            styles: {
                fillStyle: '#223a8f',
                angleIndicator: false
            }
        });

        planet.treatment = 'static';
        planet.sleep(true);
        world.add(planet);


        var distances = [];
        var distList = [];
        var bodies = [];
        var asteroidColors = ['#22feac', '#dae6eb', '#e4d9d7', '#8f9779', '#c1be77'];
        var startPoint = renderer.height / 2 -240

        function asteroid(){
          var a = Physics.body('circle', {
              x: -20,
              y: getRandomInt(-20, HEIGHT + 20),
              radius: getRandomInt(5, 15),
              mass: getRandomInt(1, 5),
              vx: 0.15,
              styles: {
                  fillStyle: asteroidColors[getRandomInt(0, 4)],
                  angleIndicator: false
              }
          });
          world.add(a);
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

            if (distance <= 400) {
                if (j[j.length - 1] < j[j.length - 2]){
                   gains[posIndex].gain.value += Math.min(1, 0.001);
                   boost.gain.value += Math.min(1,0.001)
                }
                if (j[j.length - 1] > j[j.length - 2]){
                    gains[posIndex].gain.value -= Math.max(0, 0.001);
                    boost.gain.value -= Math.max(0, 0.001);
                }
            }
            if (distance <= 300) {
                if (j[j.length - 1] < j[j.length - 2]){
                   filters[posIndex].frequency.value += Math.min(5000, 20);
                   filters[posIndex].Q.value += Math.min(20, 1);
                   
                }
                if (j[j.length - 1] > j[j.length - 2]){
                   filters[posIndex].frequency.value -= Math.max(0, 20);
                   filters[posIndex].Q.value -= Math.max(0, 1);

                }
            }
            if (distance > 300) {
                filters[posIndex].frequency.value = 0.0;
                filters[posIndex].Q.value = 0.0;

            }
            if (distance > 400) {
                gains[posIndex].gain.value = 0.0;
            }
            //if (mPos == startPoint){
              //lfos[posIndex].frequency.value = 1;
            //}
            //if (mPos != startPoint){
              //lfos[posIndex].frequency.value = 0;
            //}
        };


        $(document).on('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);


        $(document).keydown(function(e){
          if (e.keyCode === 32){
            e.preventDefault();
            oscFactory();
            asteroid();
          }
        });


        world.on('step', function () {
            world.render();
            for (var i = 0; i<bodies.length; i++){
              sound(bodies[i], i);
              console.log("gain: "+gains[0].gain.value);
              console.log("filter: "+filters[0].frequency.value);
              console.log("Q: "+filters[0].Q.value)
              console.log(distList[0]);
            };
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
            Physics.behavior('newtonian', { strength: .5 }),
            Physics.behavior('body-impulse-response'),
            edgeBounce
        ]);


        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });

    });


});
