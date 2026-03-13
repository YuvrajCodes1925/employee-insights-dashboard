import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>Employee Insights</span>
      <div className={styles.links}>
        <NavLink
          to="/list"
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          List
        </NavLink>
        <NavLink
          to="/details"
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          Details
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          Analytics
        </NavLink>
      </div>
      <button onClick={handleLogout} className={styles.logout}>Logout</button>
    </nav>
  )
}
