import { useEffect, useState, useMemo } from 'react'
import { useEmployees } from '../context/EmployeeContext'
import VirtualTable from '../components/VirtualTable'
import styles from './List.module.css'

export default function List() {
  const { employees, loading, error, fetchEmployees } = useEmployees()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees()
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return employees
    return employees.filter(emp =>
      (emp.name || emp.employee_name || '').toLowerCase().includes(q) ||
      (emp.city || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q)
    )
  }, [employees, search])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employees</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading…'
              : `${filtered.length}${filtered.length !== employees.length ? ' of ' + employees.length : ''} employees`
            }
          </p>
        </div>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search name, city, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <button onClick={fetchEmployees} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.notice}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Fetching employee data…</p>
        </div>
      ) : (
        <VirtualTable rows={filtered} />
      )}
    </div>
  )
}
