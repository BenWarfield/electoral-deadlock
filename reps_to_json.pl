#!env perl
use JSON::PP;
use strict;

$/ = "\r\n";
my @reps;
while (<>) {
	# original headers:
	# Prefix	FirstName	MiddleName	LastName	Suffix	Address	City	State	Zip+4	114 St/Dis	BioguideID	Party
	next if 1 == $.;
	my %row;
	chomp;
	@row{qw(Prefix	FirstName	MiddleName	LastName	Suffix	Address	City
	        State	Zip+4	St/Dis	BioguideID	Party  Nonvoting)} = split "\t";
	my $statedistrict = $row{"St/Dis"};
	delete @row{qw(St/Dis Prefix BioguideID Zip+4 Address City State)};
	@row{qw(State District)} = $statedistrict =~ /(\w\w)(\d\d)/;
	push @reps,  \%row;
}

print JSON::PP->new->utf8->pretty->encode(\@reps);
