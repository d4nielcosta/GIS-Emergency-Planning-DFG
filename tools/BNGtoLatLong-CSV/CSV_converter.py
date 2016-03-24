import sys
import csv
from BNGtoLatLong import OSGB36toWGS84

def convert(filename):
	"""Converts co-ordinates in the given file to lat/long from the BNG system"""
	if filename[-4:] != ".csv":
		print "Not valid input file"
		sys.exit(1)

	input_file = open(filename, "rb")

	input_csv = csv.DictReader(input_file, delimiter=",")

	#Rename fields, naively assuming 'eastings' and 'northings' are the last two fields
	fieldnames = input_csv.fieldnames
	fieldnames[-2] = "Lattitude"
	fieldnames[-1] = "Longitude"

	output_file = open(filename[:-4] + "_latLong.csv", "wb")
	output_csv = csv.DictWriter(output_file, fieldnames, delimiter=",")
	output_csv.writeheader()

	for row in input_csv:
		latLong = toLatLong(int(row["Lattitude"]), int(row["Longitude"]))
		row["Lattitude"] = latLong[0]
		row["Longitude"] = latLong[1]
		output_csv.writerow(row)

	input_file.close()
	output_file.close()

def toLatLong(E, N):
	return OSGB36toWGS84(E, N)

if __name__ == "__main__":
	convert(sys.argv[1])