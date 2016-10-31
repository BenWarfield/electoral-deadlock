(function($) {

    var collate_reps = function(replist) {
		// Take in a representative list and digest it into state lists
		// Assume the default vote for each representative is their party,
		// subject to later modification.
		var states = {};
		for (var i = 0; i < replist.length; i++) {
		    if (replist[i].Nonvoting) continue;
		    replist[i].Vote = replist[i].Party;
			var state = replist[i].State;
			if (states[state] === undefined) {
				states[state] = [];
			}
			states[state].push(replist[i])
		}
		return states;
	};


	var init_tally_display = function(state_codes) {
		for (var i = 0; i < state_codes.length; i++) {
		console.log("Adding row for " + state_codes[i]);
		    var code = state_codes[i];
			var trow = $("<tr id='tally-" + code + "'><th>"+ code +
				"</th><td class='rcount'><td class='dcount'><td class='ocount'></tr>");
			trow.data("state", code);
			$("#tally tbody").append(trow);
		}
	};

	var color_state = function(state_code, rep_list) {
		var dcount = 0;
		var rcount = 0;
		var icount = 0;
		for (var i = 0; i < rep_list.length; i++) {
		    var party = rep_list[i].Vote;
		    if ("R" === party) rcount++;
			else if ("D" === party) dcount++;
			else if ("O" === party) icount++;
		}
		var partyClass = "";
		var partyLabel;
		var majority = rep_list.length / 2;
		if (dcount > majority) {
			partyClass = "bluestate";
			partyLabel = "D";
		} else if (rcount > majority) {
			partyClass = "redstate";
			partyLabel = "R"
		} else if (icount > majority) {
			partyClass = "orangestate";
			partyLabel = "O";
		} else {
		    partyClass = "deadstate";
		    partyLabel = "NONE";
		}
		var tally_row = $("#tally-" + state_code);
		tally_row.find(".rcount").text(rcount);
		tally_row.find(".dcount").text(dcount);
		tally_row.find(".ocount").text(icount);

		document.getElementById(state_code).className.baseVal = partyClass;
		return partyLabel;
	}

	var tally_scores = function(state_reps, vote_func) {
		var dstates = 0;
		var rstates = 0;
		var ostates = 0;
		for (var i = 0; i < state_codes.length; i++) {
			var s = state_codes[i];
			console.log("State", s, " has ", state_reps[s].length);
			var foundParty = color_state(s, state_reps[s], vote_func)
			if ("D" === foundParty) {
				dstates++;
			} else if ("R" === foundParty) {
				rstates++;
			} else if ("O" === foundParty) {
				ostates++;
			}
		}
		$("#trump-state-count").text(rstates);
		$("#clinton-state-count").text(dstates);
		$("#mcmullin-state-count").text(ostates);
		$("#top-line-summary .elected").hide()
		if (rstates > 25) $("#trump-elected").show();
		else if (dstates > 25) $("#clinton-elected").show();
		else if (ostates > 25) $("#mcmullin-elected").show();
		else $("#deadlock-elected").show()

		console.log("Final score: D", dstates, ", R", rstates);
	};

	var state_reps = collate_reps(window.REPS);
	var state_codes = [];
	for (var s in state_reps) state_codes.push(s);
	state_codes.sort();

	init_tally_display(state_codes);
	tally_scores(state_reps);
	
})(jQuery);
