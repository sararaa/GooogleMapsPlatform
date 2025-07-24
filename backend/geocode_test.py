import requests

def geocode_location(description: str, api_key: str):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": description,
        "key": api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] == "OK" and data["results"]:
        result = data["results"][0]
        lat = result["geometry"]["location"]["lat"]
        lng = result["geometry"]["location"]["lng"]
        return {"lat": lat, "lng": lng, "formatted_address": result["formatted_address"]}
    else:
        print(f"Geocoding failed: {data['status']}")
        return None


#api_key = "AIzaSyBuhpMRtOjkIGQpodtDt_iHumLLRAZrUR0"
#location_desc = "There's a pothole in front of 4001 Vistosa Street in Davis, California."
#coords = geocode_location(location_desc, api_key)
#
#print(coords)