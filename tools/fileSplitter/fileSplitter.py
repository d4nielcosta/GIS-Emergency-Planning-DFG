import sys
import os
import json

#Takes the name of a geoJSON file as an argument, creates a directory of the same name and then creates
#a seperate geoJSON file for each geometry in the original file in the new directory

def importFile(path):
    dirName = makeDir(path)
    json_data = open(path).read()
    data = json.loads(json_data)
    features_array = data['features']
    header = """{"crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "type": "FeatureCollection", "features": ["""
    footer = "]}"


    for feature in features_array:
        name = feature['properties']['DZ_CODE']
        output = open(dirName +  "/" + name + ".json", "wb")
        output.write(header)
        json.dump(feature, output)
        output.write(footer)

#Will likely produce a lot of output files, so create a directory to organise them
def makeDir(path):
    dirName = path.split(".")[0]
    if not os.path.exists(dirName):
        os.makedirs(dirName)

    return dirName

importFile(sys.argv[1])