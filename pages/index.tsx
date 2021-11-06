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
            initialOptions={{ center: [135.5438, 35.2811], zoom: 8.8 }}
            onMapLoaded={handleMapLoading}
          />
        </div>
        {loading && <MapLoadingHolder className="loading-holder" />}
      </div>
    </>
  )
}

export default Home
