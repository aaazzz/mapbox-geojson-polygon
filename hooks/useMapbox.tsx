import { useState, useEffect, useRef, MutableRefObject } from 'react'
import mapboxgl from 'mapbox-gl'

export interface MapboxMapProps {
  initialOptions?: Omit<mapboxgl.MapboxOptions, 'container'>
  onMapLoaded?(map: mapboxgl.Map): void
  onMapRemoved?(): void
}

const useMapbox = ({ initialOptions = {}, onMapLoaded, onMapRemoved, }: MapboxMapProps, mapNode: MutableRefObject<null>) => {
  const [map, setMap] = useState<mapboxgl.Map>()

  useEffect(() => {
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
    
    // When loading completed
    if (onMapLoaded) mapboxMap.once('load', onMapLoaded)

    return () => {
      mapboxMap.remove()
      if (onMapRemoved) onMapRemoved()
    }
  }, [])

  return { map }
}

export {
  useMapbox
}
