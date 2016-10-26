(function(w) {
    var collate_reps = function(replist) {
		var states = {};
		for (var i = 0; i < replist.length; i++) {
		    if (replist[i].Nonvoting) continue;
			var state = replist[i].State;
			if (states[state] === undefined) {
				states[state] = [];
			}
			states[state].push(replist[i])
		}
		return states;
	};
	
	var color_state = function(state_code, rep_list) {
		var dcount = 0;
		var rcount = 0;
		var icount = 0;
		for (var i = 0; i < rep_list.length; i++) {
		    var party = rep_list[i].Party;
		    if ("R" === party) rcount++;
			else if ("D" === party) dcount++;
			else icount++;
		}
		var partyClass = "";
		var partyLabel;
		if (dcount > rcount) {
			partyClass = "bluestate";
			partyLabel = "D";
		} else {
			partyClass = "redstate";
			partyLabel = "R"
		}
		document.getElementById(state_code).className.baseVal = partyClass;
		return partyLabel;
	}
	var state_reps = collate_reps(w.REPS);
	var dstates = 0;
	var rstates = 0;
	for (var s in state_reps) {
	    console.log("State", s, " has ", state_reps[s].length);
		var foundParty = color_state(s, state_reps[s])
	    if ("D" === foundParty) {
	    	dstates++;
	    } else {
	    	rstates++;
	    }
	}
	console.log("Final score: D", dstates, ", R", rstates);
	
})(window);
