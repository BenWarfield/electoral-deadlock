(function($) {

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
		} else if (rcount > dcount) {
			partyClass = "redstate";
			partyLabel = "R"
		}
		var trow = $("<tr><th>"+ state_code + "</th><td>" + rcount + "<td>" + dcount + "<td>" + icount + "</tr>");
		trow.on('click', function(e) {alert($(this).data("state"));});
		trow.data("state", state_code);
		$("#tally tbody").append(trow);

		document.getElementById(state_code).className.baseVal = partyClass;
		return partyLabel;
	}

	var state_reps = collate_reps(window.REPS);
	var dstates = 0;
	var rstates = 0;
	var ostates = 0;
	var state_codes = [];
	for (var s in state_reps) state_codes.push(s);
	state_codes.sort();
	for (var i = 0; i < state_codes.length; i++) {
		var s = state_codes[i];
	    console.log("State", s, " has ", state_reps[s].length);
		var foundParty = color_state(s, state_reps[s])
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
	
})(jQuery);
