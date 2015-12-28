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
        console.log(moonPos.y);

        sound();
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

    planet.treatment = 'static';
    planet.sleep(true);
    world.add(planet);
    world.add(moon);
    //var planetX = planet.state.pos._[0];

    //var angle = this.state.angular.pos;
    //var scratch = Physics.scratchpad();

    //amount *= 0.00001;
    //var v = scratch.vector().set(
           // amount * Math.cos( angle ), 
            //amount * Math.sin( angle ) 
       // );
        //this.accelerate( v );
        //scratch.done();

    //laser = Physics.body('circle', {
            //x: this.state.pos.get(0) + r * cos,
            //y: this.state.pos.get(1) + r * sin,
            //vx: (0.5 + this.state.vel.get(0)) * cos,
            //vy: (0.5 + this.state.vel.get(1)) * sin,
            //radius: 2

    world.on('impulse:response', function(data){
        var collisions = data.impulse,
            col;

        for (var i = 0, l = collisions.length; i<l; ++i){
            col = collisions[i];
                play1();
        }
    });
    var moonPos = {
        x: moon.state.pos.get(),
        y: moon.state.pos.get()
    };

    var planetPos = {
        x: planet.state.pos.get(0),
        y: planet.state.pos.get(1)
    }



    function sound(){
        var moonPos = {
        x: moon.state.pos.get(0),
        y: moon.state.pos.get(1)
        };
        var planetPos = {
        x: planet.state.pos.get(0),
        y: planet.state.pos.get(1)
        };
        if ((planetPos.x + planetPos.y) - (moonPos.y + moonPos.x) < 20) {
            play1();
        }
        if ((planetPos.x + planetPos.y) - (moonPos.y + moonPos.x) < 50) {
            play2();
        }
        

    } 
   

    var addBody = function(){
        t = getRandomInt(20,300);
        var asteroid = world.add(Physics.body('circle', {
            x: -20,
            y: getRandomInt(0, HEIGHT),
            radius: getRandomInt(10, 20),
            vx: 0.1,
            mass: getRandomInt(1, 5),
            styles: {
                fillStyle: '#22feac',
                angleIndicator: '#22feac'
            }
        }));
        return asteroid
    }

  

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
        //Physics.behavior('body-collision-detection'),
        //Physics.behavior('sweep-prune'),
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

