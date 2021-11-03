import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import MapboxMap from '../components/mapbox-map'
import MapLoadingHolder from '../components/map-loading-holder'

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const handleMapLoading = () => setLoading(false)

  return (
    <>
      <Head>
        <title>Mapbox Example</title>
      </Head>
      <div className="app-container">
        <div className="map-wrapper">
          <MapboxMap
            initialOptions={{ center: [106.6770417, 10.8001182], zoom: 15 }}
            onMapLoaded={handleMapLoading}
          />
        </div>
        {loading && <MapLoadingHolder className="loading-holder" />}
      </div>
    </>
  )
}

export default Home
