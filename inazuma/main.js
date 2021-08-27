document.addEventListener("DOMContentLoaded", function() {
	const form = document.getElementById("puzzle-form");
	form.addEventListener("submit", function(e) {
		e.preventDefault();

		const patternInput = form.elements["pattern"],
			patternString = patternInput.value,
			targetInput = form.elements["target"],
			targetString = targetInput.value,
			solutions = solve(patternString, targetString, sides, ruleList),
			solutionList = document.getElementById("solution-list");

		solutionList.innerHTML = "";

		if(typeof solutions == "string") {
			let solutionNode = document.createElement("div");
			solutionNode.classList.add("solution");
			solutionNode.textContent = solutions;
			solutionList.append(solutionNode);
			return;
		}

		for(let i in solutions) {
			// Convert solution array into english instructions.
			const toEnglish = function(solution) {
				const msg = "Hit " + noun + " #",
					msg1 = "Lastly, hit " + noun + " #",
					ordinal = {
						1: ".",
						2: " twice.",
						3: " three times."
					};

				let instructions = [];

				for(let i = 0; i < solution.length; i++) {
					let j = 1, c = false;

					for(let k = i + 1; k < solution.length; k++) {
							if(solution[i] == solution[k]) {
							   j++;
							} else {
								instructions.push(msg + solution[i] + ordinal[j]);
								i = k - 1;
								c = true;
								break;
							}
					}

					if(c) {
						continue;
					}

					if(instructions.length == 0) {
						instructions.push(msg + solution[i] + ordinal[j]);
					} else {
						instructions.push(msg1 + solution[i] + ordinal[j]);
					}

					i += j;
				}

				return instructions;
			}

			let enlishSolution = toEnglish(solutions[i]),
				solutionNode = document.createElement("div"),
				subtitle = document.createElement("span"),
				ol = document.createElement("ol");

			solutionNode.classList.add("solution");
			subtitle.classList.add("subtitle");
			subtitle.textContent = "Solution " + (parseInt(i) + 1);
			solutionNode.append(subtitle);

			for(let j in enlishSolution) {
				let li = document.createElement("li");
				li.textContent = enlishSolution[j];
				ol.append(li);
			}

			solutionNode.append(ol);
			solutionList.append(solutionNode);
		}
	});
});