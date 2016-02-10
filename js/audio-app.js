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

var vGain = context.createGain();
vGain.gain.value = 0.5;
var boost = context.createGain();
boost.gain.value = 0.8;
var hpf = context.createBiquadFilter();
hpf.type = 'highpass';
hpf.frequency.value = 100;
var distortion = context.createWaveShaper();
distortion.curve = distCurve(20);
distortion.oversample = '4x';

var delay = context.createDelay();
delay.delayTime.value = 0.18;
var dFilt = context.createBiquadFilter();
dFilt.frequency.value = 1000;
var dGain = context.createGain();
dGain.gain.value = 0.6;


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

var verb = (function() {
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

boost.connect(dynamics);
boost.connect(delay);
boost.connect(vGain);

verb.connect(vGain);

vGain.connect(dynamics);

//delay effect
delay.connect(dGain);
dGain.connect(dFilt);
dFilt.connect(delay);
delay.connect(hpf);

hpf.connect(dynamics);

dynamics.connect(speaker);

//////////////                           /--DELAY--HPF--\
//OSC--GAIN--DISTORTION--FILTER--BOOST--|--------------DYNAMICS--SPEAKER(OUT)
/////////////                            \--VERB--VGAIN-/

var oscTypes = ['sine', 'triangle'],
		freqs = [130.81, 329.63, 392, 523.25];

var scale = [
	64.22,
	72.08,
	80.91,
	85.72,
	96.22,
	108,
	121.23,
	128.43
];

var oscFactory = function(){
	var o = context.createOscillator();
	o.type = 'triangle';
	o.frequency.value = scale[getRandomInt(0, 7)];
	var k = context.createGain();
	k.gain.value = 0.0;
	var filter = context.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = 10;
	filter.Q.value = 0;
	var distortion = context.createWaveShaper();
	distortion.curve = distCurve(10);
	distortion.oversample = '4x';

	o.connect(k);
	k.connect(distortion);
	distortion.connect(filter);
	filter.connect(delay);
	filter.connect(boost);


	o.start(0);
	filters.push(filter);
	gains.push(k);
	oscillators.push(o);
}



//attack
function att(t){
	x = gain.gain.setValueAtTime(0, context.currentTime);
	y = gain.gain.linearRampToValueAtTime(1, context.currentTime + t);
	return x,y;
}

//decay
function dec(t){
	x = gain.gain.setValueAtTime(1, context.currentTime);
	y = gain.gain.linearRampToValueAtTime(0, context.currentTime + t);
	return x,y;
}

//stop all oscillators
function end(){
	for(var i = 0; i < oscillators.length; i++) {
				var os = oscillators[i];
				os.stop(context.currentTime + 2);
				os.disconnect();
		};
};
