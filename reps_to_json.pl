#!/usr/bin/env perl
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
	        State	Zip+4	St/Dis	BioguideID	Party  Flags)} = split "\t";
	my $statedistrict = $row{"St/Dis"};
	$row{Nonvoting} =  "yes" if $row{Flags} =~ /NV/;
	$row{LDS} = "yes" if $row{Flags} =~ /LDS/;
	$row{NEVERTRUMP} = "yes" if $row{Flags} =~ /NT/;
	delete @row{qw(St/Dis Prefix BioguideID Zip+4 Address City State)};
	@row{qw(State District)} = $statedistrict =~ /(\w\w)(\d\d)/;
	push @reps,  \%row;
}

my $rep_json = JSON::PP->new->utf8->canonical->encode(\@reps);
print "REPS = $rep_json;"
