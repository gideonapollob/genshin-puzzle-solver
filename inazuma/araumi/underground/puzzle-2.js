// Pass a pattern from Araumi, Inazuma 2nd underground puzzle in "AAAAA" format
// and will return a list of number that represents which cubes to hit on what
// specific order. Will always give the shortest solution possible.
const solve = function(pattern, target) {
	// Common validations.
	const msg = " must be a 5-character string using the characters " +
			"A to D. Example: AABCA, BDCBB, etc.",
		msg1 = " must only use the characters A to D. Example: " +
			"AABCA, BDCBB, etc.";
	
	if(typeof pattern != "string") {
		return "[Current Pattern]" + msg;
	}

	if(pattern.length != 5) {
		return "[Current Pattern]" + msg;
	}

	let m;
	const regex = /[^A-D]/;
	pattern = pattern.toUpperCase();
	
	if((m = regex.exec(pattern)) !== null) {
		return "[Current Pattern]" + msg1;
	}

	// target

	if(typeof target != "string") {
		return "[Target Pattern]" + msg;
	}

	if(target.length != 5) {
		return "[Target Pattern]" + msg;
	}

	target = target.toUpperCase();
	
	if((m = regex.exec(target)) !== null) {
		return "[Target Pattern]" + msg1;
	}

	if(pattern == target) {
		return "The [Current Pattern] is already solved."
	}

	// Creates a list of permutations from a set of elements.
	const permute = function(set) {
		const length = set.length;
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

	// Creates list of all permissible permutation patterns using the numbers 1
	// to 5.
	const tileOrderPermutations = permute([1, 2, 3, 4, 5]),
		ruleList = [
			// Both the first and the third cube will rotate to the left if you
			// hit the first cube.
			[0, 2],

			// The first, second, and third cube will rotate to the left if you
			// hit the second cube,
			[0, 1, 2],

			// The first, third, and fifth cube will rotate to the left if you
			// hit the third cube,
			[0, 2, 4],

			// The third, fourth, and fifth cube will rotate to the left if you
			// hit the fourth cube,
			[2, 3, 4],

			// Both the third and the fifth cube will rotate to the left if you
			// hit the fifth cube.
			[2, 4]];

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
		let dictionary = {pattern: []},
			tileOrder = tileOrderPermutations[i],
			currentSolution = [];

		// The sides of the cube. A refers to the lighted tile. B refers to the 
		// tile right of the lighted tile. C refers to the tile at the back of 
		// the lighted tile. D refers to the tile at the left of the lighted
		// tile.
		const sides = "ABCD";

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

			// Gives the letter left of the current tile, for example if the
			// current tile of the cube is 'A', then when rotated, the next tile
			// is 'B'. If the current tle is 'D', then the next tile is 'A'.
			const rotateLeft = function(letter) {
				if(sides.indexOf(letter) == sides.length - 1) {
					return sides[0];
				} else {
					return sides[sides.indexOf(letter) + 1];
				}
			}

			// Shifts the letter/s of the [pattern] based on the given [indexes]
			// in respect to the [ruleList]. For example, using the pattern
			// 'BCBCA' and the indexes [2, 3, 4] (the third to fifth cubes), the
			// letters 'BCA' will be rotated, and will return 'BCCDB'.
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
		const simplifySolution = function(solution) {
			for(let j = 0; j < solution.length - sides.length + 1; j++) {
				let isRepeating = false;

				for(let k = 1; k <= (solution.length / sides.length); k++) {
					for(let l = 0; l < k; l++) {
						for(let m = 1; m < sides.length; m++) {
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
						solution.splice(j, sides.length * k);
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