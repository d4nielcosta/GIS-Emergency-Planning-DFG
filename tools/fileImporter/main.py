import ogr2ogr
import os


import_directory = "toImport/"
output_directory = "../src/data"

for filename in os.listdir(import_directory):
	ogr2ogr.main(["", "-t_srs", "EPSG:4326", "-f", "GeoJSON", output_directory + filename + ".json", filename + ".shp"])


