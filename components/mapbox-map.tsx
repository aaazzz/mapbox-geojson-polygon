import * as React from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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
    })
    map.on('move', () => {
      setCurrentLocation(map)
    })
  })

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
