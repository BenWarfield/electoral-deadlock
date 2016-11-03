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
                   RI => 'Rhode Island', C => 'South Carolina',
                   SD => 'South Dakota', TN => 'Tennessee', TX => 'Texas',
                   UT => 'Utah', VT => 'Vermont', VA => 'Virginia',
                   WA => 'Washington', WV => 'West Virginia', WI => 'Wisconsin',
                   WY => 'Wyoming');
my %CODES = reverse %STATES;
my %PARTY_CODE = (Republican=>"R", Democratic=>"D", Green=>"G", Libertarian=>"L");
my %races;

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
	$race{candidates} = \%party_candidates;
	$race{current_party} = $PARTY_CODE{$iparty};
	$races{$key} = \%party_candidates;
}

print "RACES = " . $j->encode(\%races);