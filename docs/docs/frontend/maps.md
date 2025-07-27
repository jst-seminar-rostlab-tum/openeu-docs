---
sidebar_position: 4
---
# Maps

**Author:** `Tabea Klein`

The map leverages leaflet and React-Leaflet to create an interactive visualization platform for displaying country-level data and geographic insights. The map consists of several core components that are located in ```src/components/map```. ```Map.tsx``` is the main component responsible for the map functionality using several other components.

## Leaflet setup
The leaflet map component can be configured with properties in the MapContainer element:
```ts
<MapContainer
      mapData={MapData as GeoJSON.FeatureCollection}
      zoom={4.25}
      minZoom={4}
      center={[54.5452, 25.11912]}
      countryMeetingMap={countryMeetingMap}
      countryClickDisabled={countryClickDisabled}
    >
```
Since the MapContainer component is a react-leaflet component you can easily add an customize the map behavior according to their [Map Documentation](https://leafletjs.com/reference.html#map).


The map is initialized using the following key properties of the ```Map.ts``` file located in the constants folder:

```ts
export const oceanBounds: LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
];
export const countryBaseStyle = {
  weight: 1,
  opacity: 1,
  fillOpacity: 1,
};

export const countryBorderStyle = {
  weight: 1,
  opacity: 1,
  fillOpacity: 0,
};

```
- **oceanBounds:** sets the border for the ocean layer
- **countryBaseStyle:** sets the style for the base shapes of all the countries
- **countryBorderStyle:** sets the style for the country borders

- **countryMeetingMap** contains the countries as keys and CountryData as values. See more at section 'Location Mapping'


## Map layers
The map renders layers dynamically based on user interaction and zoom level. They are stacked in the order they appear within the MapContainer.

#### Controls Layer
The zoom tracker keeps track of the zoom level and decides if the cities are shown and which size MapIndicator components(indicate how many meetings are in the country) have.

#### Country Layer
For rendering the ocean a svg overlay is used. For the shapes of the countries the data in GeoJSON format is rendered as
an additional layer.

#### Border Layer
Regular borders and borders of disputed areas are rendered in two separate leaflet layers. You can customize their style
in the ```Map.ts``` constants file (see above).


## GeoJSON integration

To focus the map on Europe, the ```cities15000.txt``` dataset from [GeoNames](https://download.geonames.org/export/dump/) is filtered. To generate the filtered list, download ```cities15000.txt``` and run the script ```utils/parseGEOCities.ts```. This will produce a JSON file ```src/domain/entities/map/euCities.json``` with entries of type:
```ts
export type CityInfo = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  population: number;
  altNames: string[];
};
```
lat and lng determines the position of the city on the map. Alt names contains all alternative names for the city, especially the native name.
This dataset is used to resolve cities from meetings.

## Location Mapping

The countries are always rendered, what we need to determine is
1. the amount of Meetings that take place in the country
2. in which city the meeting takes place

For that each meeting has a location, which contains the country, and a exact_location attribute. The exact_location is not normalized and can contain the city name, the country, the building, etc.
Also note that meetings where the location cannot be determined in the backend get 'European Union' as default.
Meetings with location 'European Union' and without further information in exact_location get mapped to Belgium, Brussels.

### Mapping Process
```MapOperations.ts``` defines the logic to build a country/city meeting map when data is fetched or filters change:

```ts
export function useCountryMeetingMap(
  meetings: Meeting[],
): Map<string, CountryData> {...}
```

Output types: 

```ts
export interface CityData {
  city: string;
  lat: number;
  lng: number;
  totalCount: number;
  meetings: Meeting[];
}

export interface CountryData {
  country: string;
  cities: Record<string, CityData>;
}
```

The ```Map<string, CountryData>``` groups cities and meetings under their respective countries.

City resolution is done using:

```ts
export function resolveCity(meeting: Meeting): CityInfo | null {...}
```

- **cityIndex:** Direct mapping from country_cityname to CityInfo
- **perCountryCities:** Groups cities by lowercase country name
- **capitalCityMap:** Tracks the most populous city per country

Gets the exact_location and tries to find a city name in that string. Following heuristics are used to do that:
1. often the first word is the city, so try check that first
2. check if any city (or alt name) of the already determined country is mentioned in the text
3. if the locattion is 'European Union', check if exact_location contains usefull information, else map to Belgium
4. defualt: use the capital city of the country