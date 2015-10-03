var interval;
var curMeasure, measures;

function play () {
	curMeasure = 1;
	measures = 4;
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			MIDI.setVolume(0, 127);
			interval = setInterval(update, 1000);
		}
	});
}

function stop () {
	clearInterval(interval);
}

function update () {
	var input = document.getElementById("chord" + curMeasure).value;
	var pivot = 1;
	if (input[1] === "b") pivot = 2;
	var strKey = input.substring(0, pivot);
	var strChord = input.substring(pivot, input.length);
	var chord = getChord(strKey, 3, strChord);
	MIDI.chordOn(0, chord, 127, 0);
	MIDI.noteOff(0, chord, 1);
	curMeasure += 1;
	if (curMeasure > measures) stop();
}

function getChord (base, octave, chord) {
	var baseNote = MIDI.keyToNote[base + octave];
	var output = [ baseNote ];
	var chordVals = chords[chord];
	for (var i in chordVals) {
		output.push(baseNote + chordVals[i]);
	}
	return output;
}

var chords = {
	"maj": [ 4, 7 ],
	"maj7": [ 4, 7, 11 ],
	"m": [ 3, 7 ],
	"m7": [ 3, 7, 10 ],
	"7": [ 4, 7, 10 ],
	"7b9": [ 4, 7, 10, 13 ]
};