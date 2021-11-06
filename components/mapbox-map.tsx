import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import { useMapbox } from '../hooks/useMapbox'
import { useMapCenter } from '../hooks/useMapCenter'
import { Feature, FeatureCollection } from 'geojson'
import ColorScale from 'color-scales'
import kyoto from './geojson/kyoto.geojson'

interface MapboxMapProps {
  initialOptions?: Omit<mapboxgl.MapboxOptions, 'container'>
  onMapLoaded?(map: mapboxgl.Map): void
  onMapRemoved?(): void
}

const MapboxMap = ({
  initialOptions = {},
  onMapLoaded,
  onMapRemoved,
}: MapboxMapProps) => {
  const mapNode = useRef(null)
  const { map } = useMapbox({ initialOptions, onMapLoaded, onMapRemoved }, mapNode)
  const { lng, lat, zoom } = useMapCenter(map)

  useEffect(() => {
    if (!map) return
    map.on('load', () => {
      map.addSource('geojson', {
        type: 'geojson',
        data: kyoto
      })
      addLayerWithRandomColor(map)
      map.addLayer({
        'id': `geojson-line`,
        'type': 'line',
        'source': 'geojson',
        'layout': {
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#000',
          'line-opacity': 0.2
        }
      })
    })
  }, [map])

  // Reduce duplicated geometry because there may be multiple elements for the same city
  // N03_007: city code
  const sanitizeGeomety = (cities: FeatureCollection): FeatureCollection => {
    const reducer = (resultArray: Array<any>, element: any) => {
      const index = resultArray.findIndex(x => x.properties['N03_007'] === element.properties['N03_007'] )
      if (index < 0) {
        resultArray.push(element)
      } else {
        resultArray[index].geometry.coordinates.concat(element.geometry.coordinates)
      }
      return resultArray
    }
    cities.features = cities.features.reduce(reducer, [])
    return cities
  }

  const addLayerWithRandomColor = (map: mapboxgl.Map) => {
    const cities: Array<String> = sanitizeGeomety(kyoto).features.map((f: Feature) => {
      if (!f.properties) return null 
      return f.properties['N03_007']
    })

    const colorScale = new ColorScale(0, cities.length, ["#ff0000", "#0000ff"], 1);
    cities.map((c, idx) => {
      map.addLayer({
        'id': `geojson-polygon-${c}-${idx}`,
        'type': 'fill',
        'source': 'geojson',
        'paint': {
          'fill-color': colorScale.getColor(idx).toHexString(),
          'fill-opacity': 0.7 
        },
        'filter': ['==', 'N03_007', c]
      })
      // listen mouse event
      map.on('mouseenter', `geojson-polygon-${c}-${idx}`, (e) => {
        if (!e.features) return
        console.log(e.features[0].properties)
      })
    })
  }

  return (
    <>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
    </>
  )
}

export default MapboxMap
