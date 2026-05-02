import csv
import json

def convert_toilets():
    input_file = "300103-3-aseos-publicos-operativos-csv.csv"
    output_file = "aseos_publicos_madrid.geojson"
    
    features = []
    
    # The CSV uses ';' as delimiter and has some encoding that might be latin-1 or utf-8
    try:
        with open(input_file, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            for row in reader:
                try:
                    lat = float(row['LATITUD'].replace(',', '.'))
                    lon = float(row['LONGITUD'].replace(',', '.'))
                    
                    # Clean up empty keys (there are many empty columns in the header)
                    properties = {k: v for k, v in row.items() if k and v and not k.startswith('Unnamed')}
                    
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "properties": properties
                    })
                except (ValueError, TypeError, KeyError):
                    continue
    except UnicodeDecodeError:
        with open(input_file, mode='r', encoding='latin-1') as f:
            reader = csv.DictReader(f, delimiter=';')
            for row in reader:
                try:
                    lat = float(row['LATITUD'].replace(',', '.'))
                    lon = float(row['LONGITUD'].replace(',', '.'))
                    properties = {k: v for k, v in row.items() if k and v}
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "properties": properties
                    })
                except (ValueError, TypeError, KeyError):
                    continue

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully converted {len(features)} toilets to {output_file}")

if __name__ == "__main__":
    convert_toilets()
