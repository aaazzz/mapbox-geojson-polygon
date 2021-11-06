import * as React from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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
  const [map, setMap] = React.useState<mapboxgl.Map>()
  const mapNode = React.useRef(null)

  const [lng, setLng] = React.useState('')
  const [lat, setLat] = React.useState('')
  const [zoom, setZoom] = React.useState('')

  const setCurrentLocation = (map: mapboxgl.Map) => {
    setLng(map.getCenter().lng.toFixed(4))
    setLat(map.getCenter().lat.toFixed(4))
    setZoom(map.getZoom().toFixed(1))
  }

  React.useEffect(() => {
    const node = mapNode.current

    if (typeof window === 'undefined' || node === null) return

    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 9,
      ...initialOptions,
    })

    setMap(mapboxMap)

    if (onMapLoaded) mapboxMap.once('load', onMapLoaded)

    return () => {
      mapboxMap.remove()
      if (onMapRemoved) onMapRemoved()
    }
  }, [])

  React.useEffect(() => {
    if (!map) return
    map.on('load', () => {
      
      setCurrentLocation(map)
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
    map.on('move', () => {
      setCurrentLocation(map)
    })
  })

  // Reduce duplicated geometry because there may be multiple elements for the same city
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
      // N03_007: city code
      return f.properties['N03_007']
    })

    const colorScale = new ColorScale(0, cities.length, ["#ff0000", "#0000ff"], 1);
    cities.map((c, idx) => {
      console.log(`geojson-polygon-${c}-${idx}`)
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
