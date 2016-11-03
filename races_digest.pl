#!/usr/bin/env perl

use JSON::PP;
use strict;

my $text = join("", <>);
my $j = JSON::PP->new();
my $data = $j->decode($text);
# print scalar @$data;

my %STATES =
                  (AL => 'Alabama', AK => 'Alaska', AZ => 'Arizona',
                   AR => 'Arkansas', CA => 'California', CO => 'Colorado',
                   CT => 'Connecticut', DE => 'Delaware', FL => 'Florida',
                   GA => 'Georgia', HI => 'Hawaii', ID => 'Idaho',
                   IL => 'Illinois', IN => 'Indiana', IA => 'Iowa',
                   KS => 'Kansas', KY => 'Kentucky',
                   LA => 'Louisiana', ME => 'Maine', MD => 'Maryland',
                   MA => 'Massachusetts', MI => 'Michigan', MN => 'Minnesota',
                   MS => 'Mississippi', MO => 'Missouri', MT => 'Montana',
                  'NE' => 'Nebraska', NJ => 'New Jersey', NH => 'New Hampshire',
                   NV => 'Nevada', NM => 'New Mexico', NY => 'New York',
                   NC => 'North Carolina', ND => 'North Dakota', OH => 'Ohio',
                   OK => 'Oklahoma', OR => 'Oregon', PA => 'Pennsylvania',
                   RI => 'Rhode Island', SC => 'South Carolina',
                   SD => 'South Dakota', TN => 'Tennessee', TX => 'Texas',
                   UT => 'Utah', VT => 'Vermont', VA => 'Virginia',
                   WA => 'Washington', WV => 'West Virginia', WI => 'Wisconsin',
                   WY => 'Wyoming');
my %CODES = reverse %STATES;
my %PARTY_CODE = (Republican=>"R", Democratic=>"D", Green=>"G", Libertarian=>"L");
my %races;

my %DAILY_KOS = # http://www.dailykos.com/story/2016/10/14/1581898/-Trump-could-cost-Republicans-the-House-Here-s-what-Democrats-path-to-a-majority-might-look-like
(
  "safeD" => ["FL10RO", "VA04RO"],
  "likelyD" => ["CA36D", "CA52D", "MD06D"],
  "leanD" , ["CA07D", "CA24DO", "FL13R", "NV04R", "NY03DO"],
  "tossup", ["AZ01DO", "CO06R", "FL18DO", "FL26R", "IA01R", "IL10R", "MI01RO", "MN02RO",
                         "MN08D", "NE02D", "NH01R", "NJ05R", "NV03RO", "NY19RO", "NY22RO", "NY24R", "PA08RO", "TX23R"],
  "leanR", ["CA10R", "CA25R", "CA49R", "CO03R", "FL07R", "IA03R", "ME02R", "MI07R", "MN03R", "NY01R", "UT04R", "VA10R", "WI08RO"],
  "likelyR", ["AK00R", "AZ02R", "CA21R", "IL12R", "IN02R", "IN09R", "KS03R", "MI06R", "MI08R", "MT00R", "NY21R", "NY23R", "PA16RO", "VA05RO"],
  "safeR", ["FL02DO"]
);
my %DK_FLIP_STATUS;

foreach my $tag (keys %DAILY_KOS) {
    foreach my $state_tag (@{$DAILY_KOS{$tag}}) {
		my $alias = $state_tag;
		$alias =~ s/[RD]O?$//;  # not so useful after all
		$DK_FLIP_STATUS{$alias} = $tag;
    }
}

for my $district_race (@$data) {
	my ($state_dist, $pvi_cell, $iname, $iparty, $istart, $istatus, $candidate_cell)
		= @$district_race;
	my ($state, $distnum) = $state_dist =~ /(.*) (\d+|at-large)$/ or die "$state_dist does not match!";
	$distnum = "0" if "at-large" eq $distnum;
	my $statecode = $CODES{$state};
	my $key = sprintf("%s%02d", $statecode, $distnum);
	my @candidates = split("\n", $candidate_cell);
	my %party_candidates;
	my @all_candidates;
	# print "$istatus\n";
	for my $candidate (@candidates) {
		my ($cname, $cparty) = $candidate =~ /(.+)\s+\(([^)]+)\)/;
		if (exists $PARTY_CODE{$cparty}) { $cparty = $PARTY_CODE{$cparty};}
		# print "$key $cparty $cname from $candidate\n";
		push @all_candidates, {name=>$cname, party=>$cparty};
		if (exists $party_candidates{$cparty}) {
			#print "Duplicate for $cparty in $key\n";
		} else {
			$party_candidates{$cparty} = $cname;
		}
	}
	my %race;
	$party_candidates{ALL} = \@all_candidates;
	$race{PVI} = int $pvi_cell;
	$race{STATE_FULL} = $state;
	$race{STATE} = $statecode;
	$race{DISTRICT} = sprintf("%02d", $distnum);
	$race{OPEN} = ($istatus ne 'Incumbent running');
	if (not $race{OPEN}) {
		$race{INCUMBENT} = $iname;
	}
	$race{prediction} = $DK_FLIP_STATUS{$key};
	$race{candidates} = \%party_candidates;
	$race{current_party} = $PARTY_CODE{$iparty};
	$races{$key} = \%race;
}

print "RACES = " . $j->pretty->encode(\%races) . ";";