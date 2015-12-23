$(document).ready(function(){
	//fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

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

	Physics(function (world) {

    var viewportBounds = Physics.aabb(-100, -100, window.innerWidth + 100 , window.innerHeight + 100),
        edgeBounce,
        renderer;

    var renderer = Physics.renderer('canvas', {
        el: 'screen'
    });

    world.add(renderer);

    world.on('step', function () {
        world.render();
    });

    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.99,
        cof: 0.8
    });

    
    window.addEventListener('resize', function () {
        viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
        edgeBounce.setAABB(viewportBounds);
    }, true);

    world.add(Physics.body('circle', {
        x: renderer.width / 2,
        y: renderer.height / 2 - 240,
        vx: 0.15,
        mass: 2,
        radius: 20,
        styles: {
            fillStyle: '#22feac',
            angleIndicator: '#22feac'
        }
    }));

    world.add(Physics.body('circle', {
        x: renderer.width / 2,
        y: renderer.height / 2,
        radius: 50,
        mass: 20,
        vx: 0.00001,
        vy: 0,
        styles: {
            fillStyle: '#223a8f',
            angleIndicator: '#223a8f'
        }
    }));



    var addBody = function(){
        t = getRandomInt(20,300);
        var asteroid = world.add(Physics.body('circle', {
            x: -20,
            y: getRandomInt(0, HEIGHT),
            radius: getRandomInt(10, 20),
            vx: 0.15,
            mass: getRandomInt(1, 5),
            styles: {
                fillStyle: '#22feac',
                angleIndicator: '#22feac'
            }
        }));
        return asteroid

        if(asteroid.mass >= 1 && asteroid.mass < 3){
            play1();
        }
        if(asteroid.mass >= 3 && asteroid.mass < 4){
            play2();
        }
        if(asteroid.mass >= 4 && asteroid.mass <= 5){
            play3();
        }
    }
    addBody();

    //var asteroid = world.add(Physics.body('circle', {
        //x: -20,
        //y: getRandomInt(0, HEIGHT),
        //radius: 10,
        //vx: -0.25,
        //mass: getRandomInt(1, 5),
        //styles: {
            //fillStyle: '#22feac',
            //angleIndicator: '#22feac'
        //}
    //}));


    function space(){
        asteroid.movingTop = !!Math.round(Math.random());
        (function animateSpace(){
                asteroid.left += 20;
                asteroid.top += (asteroid.movingTop ? -2 : 2);
                
                if (asteroid.left > canvas.width){
                    canvas.remove(asteroid);
                }
                else if (asteroid.top > 700){
                    canvas.remove(asteroid);
                } 
            canvas.renderAll();
            fabric.util.requestAnimFrame(animateSpace);
        })();
    }
   
    var attractor = Physics.behavior('attractor', {
        order: 0,
        strength: .002
    });
    world.on({
        'interact:poke': function( pos ){
            world.wakeUpAll();
            attractor.position( pos );
            world.add( attractor );
        },
        'interact:move': function( pos ){
            attractor.position( pos );
        },
        'interact:release': function(){
            world.wakeUpAll();
            world.remove( attractor );
        }
    });

   

    // add things to the world
    world.add([
        Physics.behavior('interactive', { el: renderer.container }),
        Physics.behavior('newtonian', { strength: .5 }),
        Physics.behavior('body-impulse-response'),
        edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
});

	

	//fly();
	//canvas.add(planet);
	//canvas.on({
		//'mouse:down': follow
	//});






});






