import pyproj
import json

def importFile(path):
    json_data = open(path).read()
    data = json.loads(json_data)
    str_data = str(data)
    features_array = data['features']
    # print(features_array)

    # i = 0
    # while (True):
    #     geometry = features_dict["geometry"]
    #     coord = geometry["coordinates"][0]
    #
    #     print coord

    for feature in features_array:
        geometry = feature["geometry"]
        coord_array = geometry["coordinates"]

        for coord_list in coord_array:
            for coord in coord_list:
                lat, lon = convertBNGToLatLon(coord[0], coord[1])
                # print str(coord)
                str_data = str_data.replace(str(coord), "[ " + str(lat) + ", " + str(lon) + " ]")
                # str_data = str_data.replace(str(coord), "DAVIEEEEEEEE")
                # break
            # print coord_list

        # data["features"].update(1)
        # coord_array.update(" ", "#")
        # print data
        # print coord_array
    print str_data

    output = open("output.json", "wb")

    json.dump(str_data, output)



def convertBNGToLatLon(c1, c2):

    bng = pyproj.Proj(init='epsg:27700')
    wgs84 = pyproj.Proj(init='epsg:4326')

    lon, lat = pyproj.transform(bng, wgs84, c1, c2)

    # return lat, lon
    return lon, lat

# print convertBNGToLatLon(319068.104508607, 566784.928753657)

importFile("input.json")