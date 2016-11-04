ALL=reps.js races115.js index.html vote_counter.js
js: reps.js races115.js
reps.js: text-labels-114.txt reps_to_json.pl
	./reps_to_json.pl text-labels-114.txt > reps.js
races115.js: races.json races_digest.pl
	./races_digest.pl races.json > races115.js
check-deploy:
	aws s3 sync  . s3://electoral-deadlock.com/ --exclude '*' --dryrun --include=*.html --include={races115,reps,vote_counter}.js
deploy:
	aws s3 sync  . s3://electoral-deadlock.com/ --exclude '*' --include=*.html --include={races115,reps,vote_counter}.js
