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

    Physics(function(world) {

        var viewportBounds = Physics.aabb(-100, -100, window.innerWidth + 100 , window.innerHeight + 100),
            edgeBounce,
            renderer;

        renderer = Physics.renderer('canvas', {
            el: 'screen',
            width: WIDTH,
            height: HEIGHT
        });


        world.add(renderer);

        world.on('step', function () {
            world.render();
            sound();
            sound2(a);

        });

        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.5,
            cof: 0.8
        });


        window.addEventListener('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);


        var moon = Physics.body('circle', {
            x: renderer.width / 2,
            y: renderer.height / 2 - 240,
            vx: 0.15,
            mass: 1,
            radius: 20,
            styles: {
                fillStyle: '#22feac',
                angleIndicator: false
            }
        });


        var planet = Physics.body('circle', {
            x: renderer.width / 2,
            y: renderer.height / 2,
            radius: 50,
            mass: 20,
            vx: 0.00001,
            vy: 0,
            styles: {
                fillStyle: '#223a8f',
                angleIndicator: false
            }
        });

        var a = Physics.body('circle', {
            x: renderer.width / 2 - 200, //-20,
            y: renderer.height / 2 - 250, //getRandomInt(0, HEIGHT),
            radius: 10,
            mass: 5,
            vx: 0.15,
            styles: {
                fillStyle: '#22feac',
                angleIndicator: '#22feac'
            }
        });
        
        var distances = [];
        var distList = [];
        planet.treatment = 'static';
        planet.sleep(true);
        world.add(planet);
        world.add(moon);
        //world.add(a);
        osc1.start(0);
        osc2.start(0);



        function sound(){
            var moonPos = {
            x: moon.state.pos.get(0),
            y: moon.state.pos.get(1)
            };
            var planetPos = {
            x: planet.state.pos.get(0),
            y: planet.state.pos.get(1)
            };

    				// measure the absolute distance horizontally and vertically
    				var horzDist = Math.abs(planetPos.x - moonPos.x);
    				var vertDist = Math.abs(planetPos.y - moonPos.y);

    				// calculate the distance
    				var distance = Math.sqrt(Math.pow(horzDist,2) + Math.pow(vertDist,2));
                    distances.push(Math.round(distance));
            if (distance <= 300) {
                if (distances[distances.length - 1] < distances[distances.length - 2]){
                   gain.gain.value = Math.min(gain.gain.value + 0.001,1);
                   //filter.frequency.value += 300;
                }
                if (distances[distances.length - 1] > distances[distances.length - 2]){
                   gain.gain.value = Math.max(gain.gain.value - 0.001,0);
                   //filter.frequency.value -= 300;
                }
                
            }
           
            if (distance > 300) {
                gain.gain.value = 0.0;
            }

        };

        function sound2(){
            var mPos = {
            x: a.state.pos.get(0),
            y: a.state.pos.get(1)
            };
            var planetPos = {
            x: planet.state.pos.get(0),
            y: planet.state.pos.get(1)
            };

                    // measure the absolute distance horizontally and vertically
                    var horzDist = Math.abs(planetPos.x - mPos.x);
                    var vertDist = Math.abs(planetPos.y - mPos.y);

                    // calculate the distance
                    var distance = Math.sqrt(Math.pow(horzDist,2) + Math.pow(vertDist,2));
                    distList.push(Math.round(distance));
            if (distance <= 150) {
                if (distList[distList.length - 1] < distList[distList.length - 2]){
                   gain2.gain.value += 0.01;
                }
                if (distList[distList.length - 1] > distList[distList.length - 2]){
                   gain2.gain.value -= 0.01;
                }
                
            }
           
            if (distance > 150) {
                gain2.gain.value = 0.0;
            }

        };



        var attractor = Physics.behavior('attractor', {
            order: 0,
            strength: .002
        });



        world.on({
            'interact:poke': function(pos){
                //play1();
                world.wakeUpAll();
                attractor.position(pos);
                world.add(attractor);
            },
            'interact:move': function(pos){
                attractor.position(pos);
            },
            'interact:release': function(){
                //play2();
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






    //canvas.add(planet);
    //canvas.on({
        //'mouse:down': follow
    //});






});
