// Raw SVG salary chart — zero chart libraries used
export default function SalaryChart({ employees }) {
  if (!employees || employees.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-tertiary)', fontSize: 13, padding: '16px 0' }}>
        No employee data available.
      </p>
    )
  }

  // Aggregate: sum salary and count per city
  const cityMap = {}
  employees.forEach(emp => {
    const city = emp.city
    if (!city) return
    if (!cityMap[city]) cityMap[city] = { sum: 0, count: 0 }
    cityMap[city].sum += Number(emp.salary || 0)
    cityMap[city].count++
  })

  const cities = Object.keys(cityMap).sort()
  const avgs = cities.map(c => Math.round(cityMap[c].sum / cityMap[c].count))
  const counts = cities.map(c => cityMap[c].count)
  const maxAvg = Math.max(...avgs, 1)

  // Layout constants
  const BAR_H = 34
  const GAP = 8
  const PAD_L = 130
  const PAD_R = 110
  const PAD_T = 20
  const PAD_B = 24
  const CHART_W = 660

  const H = cities.length * (BAR_H + GAP) + PAD_T + PAD_B

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${CHART_W} ${H}`}
        style={{ width: '100%', minWidth: 400, height: H, display: 'block' }}
        aria-label="Salary distribution by city"
      >
        {/* Axis line */}
        <line
          x1={PAD_L}
          y1={PAD_T - 4}
          x2={PAD_L}
          y2={H - PAD_B + 4}
          stroke="var(--color-border-strong)"
          strokeWidth="0.5"
        />

        {cities.map((city, i) => {
          const y = PAD_T + i * (BAR_H + GAP)
          const availW = CHART_W - PAD_L - PAD_R
          const bw = Math.max(4, Math.round((avgs[i] / maxAvg) * availW))

          return (
            <g key={city}>
              {/* City label */}
              <text
                x={PAD_L - 10}
                y={y + BAR_H / 2 + 4}
                textAnchor="end"
                fontSize="12"
                fill="var(--color-text-secondary)"
              >
                {city}
              </text>

              {/* Bar */}
              <rect
                x={PAD_L}
                y={y}
                width={bw}
                height={BAR_H}
                rx="4"
                fill="var(--color-accent-bg)"
                stroke="var(--color-accent)"
                strokeWidth="0.5"
              />

              {/* Avg salary label */}
              <text
                x={PAD_L + bw + 8}
                y={y + BAR_H / 2 + 4}
                fontSize="12"
                fill="var(--color-text-secondary)"
              >
                ₹{avgs[i].toLocaleString('en-IN')}
              </text>

              {/* Employee count badge */}
              <text
                x={PAD_L + bw + 8}
                y={y + BAR_H / 2 + 17}
                fontSize="10"
                fill="var(--color-text-tertiary)"
              >
                {counts[i]} emp
              </text>
            </g>
          )
        })}

        {/* X-axis label */}
        <text
          x={PAD_L + (CHART_W - PAD_L - PAD_R) / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-text-tertiary)"
        >
          Average salary (INR)
        </text>
      </svg>
    </div>
  )
}
