// Pass a pattern from Inazuma and will return a list of number that
// represents which cubes to hit on what specific order. Will always
// give the shortest solution possible.
const solve = function(pattern, target, possibleStatus, ruleList) {
	const randomPattern = function(refPattern, patternLength, sampleCount) {
		let patterns = [];

		for(let i = 0; i < sampleCount; i++) {
			let pattern = "";

			for(let j = 0; j < patternLength; j++) {
				pattern += refPattern[Math.floor((Math.random() *
					refPattern.length))];
			}

			patterns.push(pattern)
		}

		return patterns;
	};

	const samplePatterns = randomPattern(possibleStatus, ruleList.length, 2);

	// Common validations.
	const msg = " must be a " + ruleList.length + "-character string using " +
			"the characters " + possibleStatus[0] + " to " +
			possibleStatus[possibleStatus.length - 1] + ". Example: " +
			samplePatterns.join(", ") + ", etc.",
		msg1 = " must only use the characters " + possibleStatus[0] + " to " +
			possibleStatus[possibleStatus.length - 1] + ". Example: " +
			samplePatterns.join(", ") + ", etc.";
	
	if(typeof pattern != "string") {
		return "[Current Pattern]" + msg;
	}

	if(pattern.length != ruleList.length) {
		return "[Current Pattern]" + msg;
	}

	pattern = pattern.toUpperCase();

	const matchingPattern = function(str, pattern) {
		for(let i = 0; i < str.length; i++) {
			if(pattern.indexOf(str[i]) == -1) {
				return false;
			}
		}

		return true;
	}

	if(!matchingPattern(pattern, possibleStatus)) {
		return "[Current Pattern]" + msg1;
	}

	if(typeof target != "string") {
		return "[Target Pattern]" + msg;
	}

	if(target.length != ruleList.length) {
		return "[Target Pattern]" + msg;
	}

	target = target.toUpperCase();
	
	if(!matchingPattern(target, possibleStatus)) {
		return "[Target Pattern]" + msg1;
	}

	if(pattern == target) {
		return "The [Current Pattern] is already solved."
	}

	// Creates a list of permutations from a set of elements.
	const permute = function(length) {
		let set = [];

		for(let i = 1; i <= length; i++) {
			set.push(i);
		}

		let result = [set.slice()],
			c = new Array(length).fill(0),
			i = 1, k, p;

		while (i < length) {
			if (c[i] < i) {
				k = i % 2 && c[i];
				p = set[i];
				set[i] = set[k];
				set[k] = p;
				c[i]++;
				i = 1;
				result.push(set.slice());
			} else {
				c[i] = 0;
				i++;
			}
		}

		return result;
	}

	// Replaces a character determined by a given index.
	String.prototype.replaceAt = function(index, replacement) {
		return this.substr(0, index) +
			replacement +
			this.substr(index + replacement.length);
	}

	// Solutions container.
	let solutions = [];

	// Creates list of all permissible permutation patterns using the length of
	// [ruleList].
	const tileOrderPermutations = permute(ruleList.length);

	for(let i = 0; i < tileOrderPermutations.length; i++) {
		// dictionary - keeps which pattern leads to which solution. The key is
		// a String in the format of <AAAAA> and the value is a String list
		// that keeps the next possible pattern that can be derive from the key
		// so far. Will end if the next pattern is [target].
		//
		// tileOrder - is the order by which the cubes are rotated. For example,
		// if the value is [5, 1, 4, 2, 3], then the fifth cube will be hit
		// first, then the first cube, then the fourth cube, and so on.
		//
		// currentSolution - The solution pattern derived from the current
		// tileOrder, which will be compared later to other solution pattern to
		// find which is shorter.
		let dictionary = {},
			tileOrder = tileOrderPermutations[i],
			currentSolution = [];

		// Shifts the current pattern to the next possible solution that is not
		// existing yet from the [dictionary]. For example, by hitting the
		// first cube, the pattern ACACA will shift to BCBCA.
		const shift = function(originalPattern) {
			// Get the as of-the-moment pattern-solution from the [dictionary]
			// based on the [originalPattern], if there is any.
			let existingRecord = dictionary[originalPattern];

			if(existingRecord == undefined) {
				existingRecord = [];
			}

			// Gives the character next to the current tile, for example if the
			// current tile of the cube is 'A', then when rotated, the next tile
			// is 'B'. If the current tile is 'D', then the next tile is 'A'.
			//
			// For example, if the cube is a light switch with three light
			// status, it the current value is '1' on light, the next value is
			// '2' on light. If the light status is '3', the next value is back
			// to '1'
			const rotateLeft = function(letter) {
				if(possibleStatus.indexOf(letter) ==
					possibleStatus.length - 1) {
					return possibleStatus[0];
				} else {
					return possibleStatus[possibleStatus.indexOf(letter) + 1];
				}
			}

			// Shifts the character/s of the [pattern] based on the given
			// [indexes] in respect to the [ruleList]. For example, using the
			// pattern 'BCBCA' and the indexes [2, 3, 4] (the third to fifth
			// cubes), the characters 'BCA' will be rotated, and will return
			// 'BCCDB'.
			//
			// Another example, with a three-light switch '1231' and the indexes
			// [2, 3] (the third and fourth switch), the characters '31' will be
			// rotatated, and will return '1212'.
			const rotate = function(pattern, indexes) {
				for(let j in indexes) {
					pattern = pattern.replaceAt(indexes[j],
						rotateLeft(pattern[indexes[j]]));
				}

				return pattern;
			}

			// Iterates the current tile order permutation.
			for(let j in tileOrder) {
				let newPattern = originalPattern;

				// Generates a new pattern by hitting the specific cube number
				// from the current tile order permutation.
				newPattern = rotate(newPattern, ruleList[tileOrder[j] - 1]);

				// If the [newPattern] is not yet in the [dictionary], returns
				// it. If not, will proceed to hit the next specific cube number
				// from the current tile order permutation. 
				if(!existingRecord.includes(newPattern)) {
					existingRecord.push(newPattern);
					dictionary[originalPattern] = existingRecord;
					let boxNumber = parseInt(tileOrder[j]);
					currentSolution.push(boxNumber);
					return newPattern;
				}
			}
		}

		// Clones the [pattern] param to a local variable.
		let originalPattern = pattern;

		// Shifts the [originalPattern] until it becomes equal to
		// the [target].
		while(originalPattern != target) {
			originalPattern = shift(originalPattern);
		}

		// Remove four equal consecutive pattern from a [solution] list.
		// For example, given the pattern 'BCCDB' and the solution
		// [3, 3, 3, 3, 5, 5, 4, 2, 2, 1], it is said in the beginning to hit
		// the third cube four times. But by doing so you will return to the
		// original pattern, 'BCCDB', as seen below:
		//
		// *hits the third cube: BCCDB shifts to CCDDC
		// *hits the third cube: CCDDC shifts to DCADD
		// *hits the third cube: DCADD shifts to ACBDA
		// *hits the third cube: ACBDA shifts to BCCDB, same as original pattern
		//
		// Therefore, the pattern [3, 3, 3, 3, 5, 5, 4, 2, 2, 1] can be
		// simplified to [5, 5, 4, 2, 2, 1].
		//
		// Other examples:
		// 
		// [1, 2, 3, 2, 3, 2, 3, 2, 3, 4]
		// => [1, 4] removes the four consecutive [2, 3]
		//
		//
		// [1, 2, 2, 3, 5, 1, 3, 5, 1, 3, 5, 1, 3, 5, 1, 2, 2]
		// => [1, 2, 2, 2, 2] removes the four consecutive [3, 5, 1]
		// => [1] removes the four consecutive [2]
		//
		// The value four depennds on the possible of the cube. A rotating cube
		// has 4 status: side A, B, C, D. A three-light switch has three status:
		// 1 on light, 2 on light, 3 on light.
		const simplifySolution = function(solution) {
			for(let j = 0; j < solution.length - possibleStatus.length + 1; j++) {
				let isRepeating = false;

				for(let k = 1; k <= (solution.length / possibleStatus.length); k++) {
					for(let l = 0; l < k; l++) {
						for(let m = 1; m < possibleStatus.length; m++) {
							const i = j + (k * m) + l;
							if(solution[j + l] == solution[i]) {
								isRepeating = true;
							} else {
								isRepeating = false;
								break;
							}
						}

						if(!isRepeating) {
							break;
						}
					}

					if(isRepeating) {
						solution.splice(j, possibleStatus.length * k);
						j = -1;
					}
				}
			}

			return solution;
		}

		// Attempts to simplify the [currentSolution].
		currentSolution = simplifySolution(currentSolution);

		// Checks if the [currentSolution] is shorter than the current
		// [solutions]. If shorter, will clear the [solutions] list first before
		// adding the [currentSolution] to the working [solutions].
		if(solutions.length > 0) {
			let clear = false;

			for(let j in solutions) {
				if(solutions[j].length > currentSolution.length) {
					clear = true;
					break;
				}
			}

			if(clear) {
				solutions = [];
			}
		}

		// Checks if the [currentSolution] already exists in [solutions].
		let element = solutions.find(function(e) {
			if(currentSolution.length == e.length) {
				for(let j = 0; j < currentSolution.length; j++) {
					if(currentSolution[j] != e[j]) {
						return false;
					}
				}

				return true;
			}
		});

		// Add to [solutions] if not yet exists.
		if(element == undefined) {
			solutions.push(currentSolution);
		}
	}

	return solutions;
}