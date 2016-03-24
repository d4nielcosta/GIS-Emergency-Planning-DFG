# -*- coding: iso-8859-1 -*-

import os
from bs4 import BeautifulSoup

import_directory = "data/"

with open('index_model.html', 'r') as f:
    soup = BeautifulSoup(f, "html.parser")
    f.close()

data_list = soup.find("ul", {"id": "search_list_1"})

counter = 0
for filename in os.listdir(import_directory):
  if not filename.startswith("."):
    filename = filename.split(".")
    new_tag = soup.new_tag("input", type="checkbox",id=filename[0], **{'class':'area_setting'})

    if "point" not in filename[0]:
    	new_tag2 = soup.new_tag("input", type="text", id=filename[0] + "_colour", style="display: none;")
    	new_tag.append(filename[0])
	new_tag.append(new_tag2)

    else:
	new_tag.append(filename[0])

    data_list.append(new_tag)

    counter += 1

for  element in soup.find_all("input", {"type":"checkbox"}):
    element.wrap(soup.new_tag("li"))

with open('index.html', 'w') as f:
    f.write(soup.prettify().encode('UTF-8'))
    f.close()
