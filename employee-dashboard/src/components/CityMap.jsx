import { useEffect, useRef } from 'react'

/*
 * City-to-coordinate mapping strategy (for README / video explanation):
 * The API returns city names as strings (e.g. "Mumbai") but no lat/lng.
 * Instead of calling a geocoding API at runtime (network cost, rate limits),
 * we maintain a hardcoded static lookup table of major Indian cities.
 * Cities not found in the table are silently skipped.
 * Circle radius scales with employee count so busier cities appear larger.
 */
const CITY_COORDS = {
  Mumbai: [19.076, 72.877],
  Delhi: [28.704, 77.102],
  Bangalore: [12.972, 77.594],
  Chennai: [13.083, 80.271],
  Hyderabad: [17.385, 78.487],
  Pune: [18.521, 73.856],
  Kolkata: [22.572, 88.363],
  Ahmedabad: [23.023, 72.571],
  Jaipur: [26.912, 75.787],
  Surat: [21.170, 72.831],
  Lucknow: [26.847, 80.947],
  Kanpur: [26.449, 80.331],
  Nagpur: [21.145, 79.082],
  Indore: [22.719, 75.858],
  Thane: [19.218, 72.978],
  Bhopal: [23.259, 77.412],
  Patna: [25.594, 85.137],
  Coimbatore: [11.017, 76.955],
  Kochi: [9.931, 76.267],
  Chandigarh: [30.734, 76.779],
  Visakhapatnam: [17.686, 83.218],
  Vadodara: [22.307, 73.181],
  Agra: [27.176, 78.008],
  Nashik: [19.998, 73.789],
  Faridabad: [28.408, 77.317],
  Meerut: [28.984, 77.706],
  Rajkot: [22.303, 70.801],
  Varanasi: [25.317, 82.974],
  Srinagar: [34.083, 74.797],
  Aurangabad: [19.877, 75.343],
}

export default function CityMap({ employees }) {
  const mapRef = useRef(null)
  const leafMapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current) return
    if (leafMapRef.current) {
      // Map already exists — just update markers
      updateMarkers(leafMapRef.current, employees)
      return
    }

    import('leaflet').then(({ default: L }) => {
      const map = L.map(mapRef.current, { zoomControl: true }).setView([20.59, 78.96], 4)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      leafMapRef.current = map
      updateMarkers(map, employees)
    })

    return () => {
      if (leafMapRef.current) {
        leafMapRef.current.remove()
        leafMapRef.current = null
        markersRef.current = []
      }
    }
  }, [])

  useEffect(() => {
    if (leafMapRef.current && employees.length > 0) {
      updateMarkers(leafMapRef.current, employees)
    }
  }, [employees])

  function updateMarkers(map, emps) {
    import('leaflet').then(({ default: L }) => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Count employees per city
      const cityCount = {}
      emps.forEach(emp => {
        if (emp.city) cityCount[emp.city] = (cityCount[emp.city] || 0) + 1
      })

      // Count avg salary per city
      const citySalary = {}
      emps.forEach(emp => {
        if (!emp.city) return
        if (!citySalary[emp.city]) citySalary[emp.city] = { sum: 0, count: 0 }
        citySalary[emp.city].sum += Number(emp.salary || 0)
        citySalary[emp.city].count++
      })

      Object.entries(cityCount).forEach(([city, count]) => {
        const coords = CITY_COORDS[city]
        if (!coords) return

        const avg = citySalary[city]
          ? Math.round(citySalary[city].sum / citySalary[city].count)
          : 0

        const radius = Math.min(8 + count * 0.25, 22)

        const marker = L.circleMarker(coords, {
          radius,
          fillColor: '#185FA5',
          color: '#0c447c',
          weight: 1.5,
          fillOpacity: 0.7,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-size:13px;line-height:1.6">
              <strong>${city}</strong><br>
              ${count} employees<br>
              Avg salary: ₹${avg.toLocaleString('en-IN')}
            </div>`
          )

        markersRef.current.push(marker)
      })
    })
  }

  return (
    <div
      ref={mapRef}
      style={{ height: 380, borderRadius: 'var(--radius-lg)', width: '100%' }}
    />
  )
}
