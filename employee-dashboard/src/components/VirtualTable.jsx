import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '../context/EmployeeContext'
import styles from './VirtualTable.module.css'

const ROW_HEIGHT = 52
const BUFFER = 6

/*
 * INTENTIONAL BUG (documented in README):
 * The `scrollTop` state variable inside onScroll is captured via a stale closure.
 * When the user scrolls very fast, `scrollTop` inside the render calculation
 * can lag by one event tick because setScrollTop triggers an async re-render,
 * causing the rendered slice to briefly show the wrong rows.
 * This is a classic stale closure / missing dependency bug:
 * the visibleSlice memo depends on `scrollTop` from state but the DOM
 * has already moved further. Fix would be to read containerRef.current.scrollTop
 * directly inside renderRows instead of relying on React state.
 */

export default function VirtualTable({ rows }) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { setSelectedEmployee } = useEmployees()

  const containerHeight = 480

  // Total scrollable height = all rows stacked
  const totalHeight = rows.length * ROW_HEIGHT

  // Virtualization math:
  // 1. First visible row index = floor(scrollTop / ROW_HEIGHT)
  // 2. Subtract BUFFER rows above for smooth upward scroll
  // 3. Last visible row = ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER)
  const endIndex = Math.min(
    rows.length - 1,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER
  )

  const visibleRows = rows.slice(startIndex, endIndex + 1)

  // INTENTIONAL BUG: stale closure on scrollTop (see comment above)
  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  function handleRowClick(emp) {
    setSelectedEmployee(emp)
    navigate(`/details/${emp.id}`)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>Name</span>
        <span>City</span>
        <span>Department</span>
        <span>Salary</span>
        <span></span>
      </div>
      <div
        ref={containerRef}
        className={styles.container}
        style={{ height: containerHeight }}
        onScroll={onScroll}
      >
        {/* Spacer sets total scroll height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleRows.map((emp, i) => {
            const absoluteIndex = startIndex + i
            return (
              <div
                key={emp.id ?? absoluteIndex}
                className={styles.row}
                style={{ top: absoluteIndex * ROW_HEIGHT }}
                onClick={() => handleRowClick(emp)}
              >
                <span className={styles.name}>
                  {emp.name || emp.employee_name || `Employee ${absoluteIndex + 1}`}
                </span>
                <span>{emp.city || '—'}</span>
                <span>
                  <span className="tag">{emp.department || 'Staff'}</span>
                </span>
                <span className={styles.salary}>
                  ₹{Number(emp.salary || 0).toLocaleString('en-IN')}
                </span>
                <span className={styles.view}>View →</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles.footer}>
        Showing {rows.length} employees &middot; scroll to load more rows
      </div>
    </div>
  )
}
