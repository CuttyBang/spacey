
//webAudio set up
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var speaker = context.destination;

var oscillators = [],
	gains = [],
	filters = [],
	getRandomInt = fabric.util.getRandomInt;

var dynamics = context.createDynamicsCompressor();
dynamics.threshold.value = -50;
dynamics.knee.value = 40;
dynamics.ratio.value = 12;
dynamics.reduction.value = -5;
dynamics.attack.value = 0;
dynamics.release.value = 0.3;

var master = context.createGain();
master.gain.value = 1;
var vGain = context.createGain();
vGain.gain.value = 0.3;
var boost = context.createGain();
boost.gain.value = 0.8;
var pre = context.createGain();
pre.gain.value = 0.8;
var hpf = context.createBiquadFilter();
hpf.type = 'highpass';
hpf.frequency.value = 100;

var delay = context.createDelay();
delay.delayTime.value = 0.18;
var dFilt = context.createBiquadFilter();
dFilt.frequency.value = 1000;
var dGain = context.createGain();
dGain.gain.value = 0.6;

//distortion(overdrive)
function distCurve(amt){
	var k = typeof amt === 'number' ? amt : 50,
		n_samples = 44100,
		curve = new Float32Array(n_samples),
		deg = Math.PI / 180,
		i = 0,
		x;
	for ( ; i < n_samples; ++i){
		x = i * 2 / n_samples -1;
		curve[i] = (3+k)*x*20*deg/(Math.PI + k * Math.abs(x));
	}
	return curve;
};

//reverb
var verb = (function(){
	var convolver = context.createConvolver(),
			noiseBuffer = context.createBuffer(2, 3 * context.sampleRate, context.sampleRate),
			left = noiseBuffer.getChannelData(0),
			right = noiseBuffer.getChannelData(1);
	for (var i = 0; i < noiseBuffer.length; i++) {
			left[i] = Math.random() * 2 - 1;
			right[i] = Math.random() * 2 - 1;
	}
	convolver.buffer = noiseBuffer;
	convolver.normalize = true;
	return convolver;
})();

//boost->compression
boost.connect(dynamics);
//boost-->sends
boost.connect(delay);
boost.connect(vGain);

//reverb effect-->preamp
vGain.connect(verb);
verb.connect(pre);

//delay effect-->preamp
delay.connect(dGain);
dGain.connect(dFilt);
dFilt.connect(delay);
delay.connect(hpf);
hpf.connect(pre);
//preamp-->compression
pre.connect(dynamics);
//dynamic compression-->master gain----->output
dynamics.connect(master);
master.connect(speaker);

//////////////
//OSC--GAIN--DISTORTION--FILTER--BOOST-----------------DYNAMICS--SPEAKER(OUT)
/////////////                      |\--VGain--VERB------\ |
//////                             \--DELAY--HPF-------PREAMP

var oscTypes = ['sine', 'triangle'],
		freqs = [130.81, 329.63, 392, 523.25];

var scale = [
	130.81,
	128.43,
	121.23,
	108,
	96.22,
	85.72,
	80.91,
	72.08,
	64.22,
	60.1
];
/*
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
*/


//attack
function att(t){
	x = gain.gain.setValueAtTime(0, context.currentTime);
	y = gain.gain.linearRampToValueAtTime(1, context.currentTime + t);
	return x,y;
}

//decay
function dec(g, t){
	x = g.gain.setValueAtTime(1, context.currentTime);
	y = g.gain.linearRampToValueAtTime(0, context.currentTime + t);
	return x,y;
}

//stop all oscillators
function end(n, t){
	if(n){
		n.stop(context.currentTime + t);
		n.disconnect();
	}
	else{
		for(var i = 0; i < oscillators.length; i++){
			var os = oscillators[i];
			os.stop(context.currentTime + t);
			os.disconnect();
		}
	}
}
