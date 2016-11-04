(function($) {

    var collate_reps = function(replist) {
		// Take in a representative list and digest it into state lists
		// Assume the default vote for each representative is their party,
		// subject to later modification.
		var states = {};
		for (var i = 0; i < replist.length; i++) {
			rep = replist[i];
		    if (replist[i].Nonvoting) continue;
		    replist[i].Vote = replist[i].Party;
		    if (!rep.Name) {
				rep.Name = rep.FirstName + " " + rep.MiddleName + " " + rep.LastName;
		    }
			var state = replist[i].State;
			if (states[state] === undefined) {
				states[state] = [];
			}
			states[state].push(rep);
		}
		return states;
	};

	var init_tally_display = function(state_codes) {
		for (var i = 0; i < state_codes.length; i++) {
			// console.log("Adding row for " + state_codes[i]);
		    var code = state_codes[i];
			var trow = $("<tr id='tally-" + code + "'><th>"+ code +
				"</th><td class='rcount'><td class='dcount'><td class='ocount'></tr>");
			trow.data("state", code);
			$("#tally tbody").append(trow);
		}
	};

	var color_state = function(state_code, rep_list, vote_func) {
		if (undefined === vote_func) {
		    vote_func = function(rep) { return rep.Party; };
		}
		var counts = { "R": 0, "D": 0, "O": 0};
		for (var i = 0; i < rep_list.length; i++) {
			var vote = vote_func(rep_list[i]);
			rep_list[i].Vote = vote;
			counts[vote]++;
		}
		var partyClass = "";
		var partyLabel;
		var majority = rep_list.length / 2;
		if (counts.D > majority) {
			partyClass = "bluestate";
			partyLabel = "D";
		} else if (counts.R > majority) {
			partyClass = "redstate";
			partyLabel = "R"
		} else if (counts.O > majority) {
			partyClass = "orangestate";
			partyLabel = "O";
		} else {
		    partyClass = "deadstate";
		    partyLabel = "NONE";
		}
		var tally_row = $("#tally-" + state_code);
		tally_row.find(".rcount").text(counts.R);
		tally_row.find(".dcount").text(counts.D);
		tally_row.find(".ocount").text(counts.O);

		document.getElementById(state_code).className.baseVal = partyClass;
		return partyLabel;
	}

	var tally_scores = function(state_reps, vote_func) {
		var dstates = 0;
		var rstates = 0;
		var ostates = 0;
		for (var i = 0; i < state_codes.length; i++) {
			var s = state_codes[i];
			// console.log("State", s, " has ", state_reps[s].length);
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

		// console.log("Final score: D", dstates, ", R", rstates);
	};
	var create_replist = function(findwinner) {
		var newcongress = [];
		var oldreps = REPS;
		for (var i = 0; i < oldreps.length; i++) {
			var rep = oldreps[i];
			if (rep.Nonvoting) continue;
			var code = rep.State + rep.District;
			var race = RACES[code];
			// console.log("index " + i + " code " + code + " race ", race);
			var digested = {State: rep.State, District: rep.District};
			var winner = findwinner(race);
			digested.Party = winner;
			digested.Name = race.candidates[winner];
			if (rep.Flags) {
				if (digested.Name == race.INCUMBENT) {
					// and screw you for making list iteration annoying, JS
					digested.NEVERTRUMP = rep.NEVERTRUMP;
					digested.LDS = rep.LDS;
					//console.log("Keeping flags for " + rep.Name)
				} else {
					console.log("Ditching flags for " + rep.Name)
				}
			}
			newcongress.push(digested)
			// console.log(digested);
		}
		return newcongress;
	};
	var c114 = collate_reps(window.REPS);

	var state_codes = [];
	for (var s in c114) state_codes.push(s);
	state_codes.sort();
	init_tally_display(state_codes);

	var CONGRESS = c114;
	var do_tally = function() {
		var lds_on = $("[name=vote_choices] [name=lds_mcmullin]").is(":checked");
		var nt_on = $("[name=vote_choices] [name=nt_mcmullin]").is(":checked");
		console.log("For this tally, LDS selection is " + lds_on + " and NT is " + nt_on);
		var vote_decider = function(rep) {
			if ( (lds_on && rep.LDS) || (nt_on && rep.NEVERTRUMP) ) {
				return "O";
			} else {
				return rep.Party;
			}
		};
		tally_scores(CONGRESS, vote_decider);
		$("#tally").show();
		$("#top-line-summary").show();
	};
	var get_congress_maker = function(prediction_results) {
		var pick_race_winner = function(r) {
			var winparty = r.current_party;
			if (r.prediction && prediction_results[r.prediction]) {
				winparty = prediction_results[r.prediction];
			}
			return winparty;
		};
		return function() { return collate_reps(create_replist(pick_race_winner));};
	};

	var congress_dispatch = {
		c114: function() { return c114; },
		c115_safe: get_congress_maker({safeD: "D", safeR: "R"}),
		c115_ok_d: get_congress_maker({leanD:"D", tossup:"D", safeD: "D", safeR: "R"}),
		c115_ok_r: get_congress_maker({leanR:"R", tossup:"R", safeD: "D", safeR: "R"}),
		c115_good_d: get_congress_maker({leanR:"D", tossup:"D", leanD: "D", safeD: "D", safeR: "R"}),
		c115_good_r: get_congress_maker({leanR:"R", tossup:"R", leanD: "R", safeD: "D", safeR: "R"})
	};
	$("form[name=vote_choices] input").on("change", do_tally);
	$("form[name=vote_choices] [name=congress]").on("change", function() {
		var congress_choice = $(this).val();
		CONGRESS = congress_dispatch[congress_choice]();
		do_tally();
	});
})(jQuery);
