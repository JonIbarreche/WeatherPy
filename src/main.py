import requests
from pprint import pprint

Clave_API = '2562242488218794bece0a82f3e2e7db'

ciudad = input("Introduce una ciudad: ")

url = "http://api.openweathermap.org/data/2.5/weather?q="+Clave_API+"&appid="+ciudad

weather_data = requests.get(url).json()

pprint(weather_data)