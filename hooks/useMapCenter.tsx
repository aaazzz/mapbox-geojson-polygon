import { useState, useEffect } from 'react'

const useMapCenter = (map?: mapboxgl.Map) => {
  const [lng, setLng] = useState('')
  const [lat, setLat] = useState('')
  const [zoom, setZoom] = useState('')

  const setMapCenter = (map: mapboxgl.Map) => {
    setLng(map.getCenter().lng.toFixed(4))
    setLat(map.getCenter().lat.toFixed(4))
    setZoom(map.getZoom().toFixed(1))
  }

  useEffect(() => {
    if (!map) return

    map.on('load', () => {
      setMapCenter(map)
    })
    map.on('move', () => {
      setMapCenter(map)
    })
  })

  return { lng, lat, zoom }
}

export default useMapCenter
