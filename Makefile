reps.js: text-labels-114.txt reps_to_json.pl
	./reps_to_json.pl text-labels-114.txt > reps.js
races115.js: races.json races_digest.pl
	./races_digest.pl races.json > races115.js
