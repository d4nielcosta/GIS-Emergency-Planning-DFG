import sys
import json
from BNGtoLatLong import OSGB36toWGS84

def convert(filename):
    """Converts co-ordinates in the given file to lat/long from the BNG system"""
    if filename[-5:] != ".json":
        print "Not valid input file"
        sys.exit(1)

    input_file = open(filename, "rb")
    data = json.load(input_file)
    input_file.close()

    for i in range(0,len(data["features"])):
        if data["features"][i]["geometry"]["type"] == "MultiPolygon":
            multi = True
        else:
            multi = False
        for j in range(0, len(data["features"][i]["geometry"]["coordinates"])):
            for k in range(0, len(data["features"][i]["geometry"]["coordinates"][j])):
                if multi:
                    for l in range(0, len(data["features"][i]["geometry"]["coordinates"][j][k])):
                        data["features"][i]["geometry"]["coordinates"][j][k][l] = toLatLong(data["features"][i]["geometry"]["coordinates"][j][k][l][0], data["features"][i]["geometry"]["coordinates"][j][k][l][1]) #Bleurgh
                else:
                    data["features"][i]["geometry"]["coordinates"][j][k] = toLatLong(data["features"][i]["geometry"]["coordinates"][j][k][0], data["features"][i]["geometry"]["coordinates"][j][k][1])

    output_file = open(filename[:-5] + "_latLong.json", "wb")
    json.dump(data, output_file)
    output_file.close()

def toLatLong(E, N):
    #Swaps the values after conversion
    converted = OSGB36toWGS84(E, N)
    coords = converted[1], converted[0]
    return coords

if __name__ == "__main__":
    convert(sys.argv[1])