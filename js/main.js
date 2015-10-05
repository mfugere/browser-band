angular.module("browserBand", [])
	.factory("ChordService", function () {
		var chords = {
			"maj": [ 4, 7 ],
			"maj7": [ 4, 7, 11 ],
			"m": [ 3, 7 ],
			"m7": [ 3, 7, 10 ],
			"7": [ 4, 7, 10 ],
			"7b9": [ 4, 7, 10, 13 ]
		};
		var getChord = function (base, octave, name) {
			var baseNote = MIDI.keyToNote[base + octave];
			var output = [ baseNote ];
			var chordVals = chords[name];
			for (var i in chordVals) {
				output.push(baseNote + chordVals[i]);
			}
			return output;
		};
		return {
			getChord: getChord
		}
	})
	.controller("MainController", [ "$scope", "$interval", "ChordService", function ($scope, $interval, ChordService) {
		var interval;
		$scope.measures = [];
		$scope.numMeasures = 4;
		$scope.timeSignature = 4;
		$scope.tempo = 250; // Millis per 1/4 measure
		$scope.highlight = [];
		$scope.play = function () {
			MIDI.loadPlugin({
				soundfontUrl: "./soundfont/",
				instrument: "acoustic_grand_piano",
				onsuccess: function() {
					MIDI.setVolume(0, 127);
					$scope.currentMeasure = [ 0, 0 ];
					$scope.currentChord = ChordService.getChord("C", 3, "maj");
					interval = $interval(function () {
						$scope.update();
						$scope.currentMeasure[1] += 1;
						if ($scope.currentMeasure[1] >= $scope.timeSignature) {
							$scope.currentMeasure[0] += 1;
							$scope.currentMeasure[1] = 0;
						}
						if ($scope.currentMeasure[0] >= $scope.numMeasures) $scope.stop();
					}, $scope.tempo);
				}
			});
		};
		$scope.stop = function () {
			$interval.cancel(interval);
		};
		$scope.update = function () {
			var input = $scope.measures[$scope.currentMeasure[0]][$scope.currentMeasure[1]];
			if (input) {
				var pivot = 1;
				if (input[1] === "b") pivot = 2;
				var strKey = input.substring(0, pivot);
				var strChord = input.substring(pivot, input.length);
				$scope.currentChord = ChordService.getChord(strKey, 3, strChord);
			}
			$scope.highlight = [ $scope.currentMeasure[0], $scope.currentMeasure[1] ];
			MIDI.chordOn(0, $scope.currentChord, 127, 0);
			MIDI.noteOff(0, $scope.currentChord, 1);
		};
		$scope.$watch("timeSignature", function () {
			$scope.measures = [];
			for (var i = 0; i < $scope.numMeasures; i++) {
				$scope.measures.push([]);
				for (var j = 0; j < $scope.timeSignature; j++) {
					$scope.measures[i].push("");
				}
			}
		});
		$scope.$watch("numMeasures", function (newVal, oldVal) {
			if ($scope.measures.length > 0) {
				if (newVal < $scope.measures.length) {
					for (var i = 0; i < (oldVal - newVal); i++) $scope.measures.pop();
				} else {
					for (var i = 0; i < (newVal - oldVal); i++) {
						$scope.measures.push([]);
						for (var j = 0; j < $scope.timeSignature; j++) {
							$scope.measures[i].push("");
						}
					}
				}
			} else {
				for (var i = 0; i < $scope.numMeasures; i++) {
					$scope.measures.push([]);
					for (var j = 0; j < $scope.timeSignature; j++) {
						$scope.measures[i].push("");
					}
				}
			}
		});
	}]);