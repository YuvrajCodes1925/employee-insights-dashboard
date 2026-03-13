import React, { createContext, useContext, useState, useCallback } from 'react'

const EmployeeContext = createContext(null)

const API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'
const MERGED_KEY = 'eid_merged_image'

function generateMockData() {
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'
  ]
  const firstNames = ['Aarav', 'Priya', 'Rohan', 'Neha', 'Vikram', 'Anita', 'Suresh', 'Kavita', 'Arjun', 'Deepa']
  const lastNames = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Shah', 'Reddy', 'Nair']
  return Array.from({ length: 300 }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
    employee_name: `${firstNames[i % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
    city: cities[i % cities.length],
    salary: 25000 + Math.floor(Math.random() * 125000),
    department: ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing'][i % 5],
    email: `emp${i + 1}@company.com`,
  }))
}

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [mergedImage, setMergedImage] = useState(() => {
    return localStorage.getItem(MERGED_KEY) || null
  })

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: '123456' }),
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setEmployees(data)
      } else if (data.data && Array.isArray(data.data)) {
        setEmployees(data.data)
      } else {
        throw new Error(data.ErrorDescription || 'Unexpected API response')
      }
    } catch (err) {
      console.warn('API failed, using mock data:', err.message)
      setEmployees(generateMockData())
      setError('Using mock data (API unavailable)')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveMergedImage = useCallback((dataUrl) => {
    setMergedImage(dataUrl)
    localStorage.setItem(MERGED_KEY, dataUrl)
  }, [])

  return (
    <EmployeeContext.Provider value={{
      employees,
      loading,
      error,
      fetchEmployees,
      selectedEmployee,
      setSelectedEmployee,
      mergedImage,
      saveMergedImage,
    }}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext)
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider')
  return ctx
}
