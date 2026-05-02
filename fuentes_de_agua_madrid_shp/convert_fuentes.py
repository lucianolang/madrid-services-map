#!/usr/bin/env python3
import csv
import json
import math
import struct
from datetime import datetime, timezone
from pathlib import Path


BASE = Path(__file__).resolve().parent
SHP = BASE / "FUENTES_DE_AGUA.shp"
DBF = BASE / "FUENTES_DE_AGUA.dbf"
CSV_OUT = BASE.parent / "fuentes_de_agua_madrid.csv"
GEOJSON_OUT = BASE.parent / "fuentes_de_agua_madrid.geojson"


def read_points(path):
    points = []
    with path.open("rb") as file:
        header = file.read(100)
        shape_type = struct.unpack("<i", header[32:36])[0]
        if shape_type != 1:
            raise ValueError(f"Expected point shapefile, got shape type {shape_type}")

        while True:
            record_header = file.read(8)
            if not record_header:
                break
            if len(record_header) != 8:
                raise ValueError("Truncated shapefile record header")

            _, content_words = struct.unpack(">2i", record_header)
            content = file.read(content_words * 2)
            record_shape_type = struct.unpack("<i", content[:4])[0]
            if record_shape_type == 0:
                points.append(None)
                continue
            if record_shape_type != 1:
                raise ValueError(f"Unexpected record shape type {record_shape_type}")

            x, y = struct.unpack("<2d", content[4:20])
            points.append((x, y))
    return points


def decode_field(raw, field_type):
    text = raw.decode("latin-1", errors="replace").strip()
    if not text or set(text) == {"*"}:
        return None
    if field_type in {"N", "F"}:
        if "." in text:
            return float(text)
        return int(text)
    if field_type == "D" and len(text) == 8:
        return f"{text[:4]}-{text[4:6]}-{text[6:8]}"
    return text


def read_dbf(path):
    with path.open("rb") as file:
        header = file.read(32)
        record_count = struct.unpack("<I", header[4:8])[0]
        header_length = struct.unpack("<H", header[8:10])[0]
        record_length = struct.unpack("<H", header[10:12])[0]

        fields = []
        while file.tell() < header_length - 1:
            descriptor = file.read(32)
            if descriptor[0] == 0x0D:
                break
            name = descriptor[:11].split(b"\x00", 1)[0].decode("ascii")
            field_type = chr(descriptor[11])
            length = descriptor[16]
            fields.append((name, field_type, length))

        file.seek(header_length)
        rows = []
        for _ in range(record_count):
            record = file.read(record_length)
            if not record or record[0:1] == b"*":
                continue
            offset = 1
            row = {}
            for name, field_type, length in fields:
                raw = record[offset : offset + length]
                row[name] = decode_field(raw, field_type)
                offset += length
            rows.append(row)
    return rows


def utm30n_etrs89_to_wgs84(easting, northing):
    # ETRS89 / UTM zone 30N is effectively WGS84 UTM zone 30N for this use.
    a = 6378137.0
    f = 1 / 298.257223563
    k0 = 0.9996
    e2 = f * (2 - f)
    ep2 = e2 / (1 - e2)
    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    x = easting - 500000.0
    y = northing
    lon0 = math.radians(-3.0)
    m = y / k0
    mu = m / (a * (1 - e2 / 4 - 3 * e2**2 / 64 - 5 * e2**3 / 256))
    j1 = 3 * e1 / 2 - 27 * e1**3 / 32
    j2 = 21 * e1**2 / 16 - 55 * e1**4 / 32
    j3 = 151 * e1**3 / 96
    j4 = 1097 * e1**4 / 512
    fp = mu + j1 * math.sin(2 * mu) + j2 * math.sin(4 * mu) + j3 * math.sin(6 * mu) + j4 * math.sin(8 * mu)
    sin_fp = math.sin(fp)
    cos_fp = math.cos(fp)
    tan_fp = math.tan(fp)
    c1 = ep2 * cos_fp**2
    t1 = tan_fp**2
    n1 = a / math.sqrt(1 - e2 * sin_fp**2)
    r1 = a * (1 - e2) / (1 - e2 * sin_fp**2) ** 1.5
    d = x / (n1 * k0)
    lat = fp - (n1 * tan_fp / r1) * (
        d**2 / 2
        - (5 + 3 * t1 + 10 * c1 - 4 * c1**2 - 9 * ep2) * d**4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1**2 - 252 * ep2 - 3 * c1**2) * d**6 / 720
    )
    lon = lon0 + (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1**2 + 8 * ep2 + 24 * t1**2) * d**5 / 120
    ) / cos_fp
    return math.degrees(lon), math.degrees(lat)


def main():
    points = read_points(SHP)
    rows = read_dbf(DBF)
    if len(points) != len(rows):
        raise ValueError(f"Shape count {len(points)} does not match DBF row count {len(rows)}")

    features = []
    csv_rows = []
    for row, point in zip(rows, points):
        if point is None:
            lon = lat = x = y = None
        else:
            x, y = point
            lon, lat = utm30n_etrs89_to_wgs84(x, y)

        properties = dict(row)
        if "FECHA_INST" in properties and properties["FECHA_INST"]:
            properties["FECHA_INSTALACION"] = properties["FECHA_INST"]
        properties["x_etrs89_utm30n"] = x
        properties["y_etrs89_utm30n"] = y
        properties["longitude"] = lon
        properties["latitude"] = lat
        csv_rows.append(properties)
        features.append(
            {
                "type": "Feature",
                "id": row.get("ID"),
                "geometry": None if lon is None else {"type": "Point", "coordinates": [lon, lat]},
                "properties": properties,
            }
        )

    fieldnames = list(csv_rows[0].keys())
    with CSV_OUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)

    geojson = {
        "type": "FeatureCollection",
        "name": "fuentes_de_agua_madrid",
        "source": "Ayuntamiento de Madrid Geoportal FUENTES_DE_AGUA SHP",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "features": features,
    }
    GEOJSON_OUT.write_text(json.dumps(geojson, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {len(features)} records")
    print(CSV_OUT)
    print(GEOJSON_OUT)


if __name__ == "__main__":
    main()
