import { useEmployees } from '../context/EmployeeContext'
import SalaryChart from '../components/SalaryChart'
import CityMap from '../components/CityMap'
import styles from './Analytics.module.css'

export default function Analytics() {
  const { mergedImage, employees } = useEmployees()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Audit image</h2>
        <div className="card">
          {mergedImage ? (
            <>
              <img src={mergedImage} alt="Merged audit" className={styles.auditImg} />
              <a href={mergedImage} download="audit-image.png" className={styles.downloadBtn}>
                Download image
              </a>
            </>
          ) : (
            <p className={styles.empty}>
              No merged image yet. Complete identity verification on the Details page first.
            </p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Salary distribution by city</h2>
        <p className={styles.sectionNote}>
          Average salary per city — built with raw SVG, no chart library
        </p>
        <div className="card">
          <SalaryChart employees={employees} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>City map</h2>
        <p className={styles.sectionNote}>
          Cities geocoded via a static city→coordinate lookup table (no geocoding API needed)
        </p>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <CityMap employees={employees} />
        </div>
      </section>
    </div>
  )
}
