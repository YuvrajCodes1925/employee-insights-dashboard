import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEmployees } from '../context/EmployeeContext'
import styles from './Details.module.css'

export default function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, selectedEmployee, setSelectedEmployee, saveMergedImage } = useEmployees()

  const videoRef = useRef(null)
  const snapCanvasRef = useRef(null)
  const sigCanvasRef = useRef(null)
  const streamRef = useRef(null)

  const [camState, setCamState] = useState('idle') // idle | active | captured
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(false)
  const [mergeMsg, setMergeMsg] = useState('')
  const lastPos = useRef({ x: 0, y: 0 })

  // Resolve employee from URL param or context
  const emp = selectedEmployee || employees.find(e => String(e.id) === String(id))

  useEffect(() => {
    if (!emp && employees.length > 0) {
      navigate('/list')
    }
  }, [emp, employees])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (sigCanvasRef.current) {
      initSigCanvas(photoDataUrl)
    }
  }, [photoDataUrl])

  // ── Camera ──────────────────────────────────────────────
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCamState('active')
    } catch (err) {
      alert('Camera access denied or unavailable.\n' + err.message)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCamState(prev => prev === 'active' ? 'idle' : prev)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = snapCanvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setPhotoDataUrl(dataUrl)
    stopCamera()
    setCamState('captured')
  }

  function retakePhoto() {
    setPhotoDataUrl(null)
    setHasSig(false)
    setMergeMsg('')
    setCamState('idle')
    initSigCanvas(null)
  }

  // ── Signature canvas ────────────────────────────────────
  function initSigCanvas(bgUrl) {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth || 640
    const H = 260
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    if (bgUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H)
        // Overlay translucent sign-here strip
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.fillRect(0, H - 60, W, 60)
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Sign here', W / 2, H - 12)
        ctx.textAlign = 'left'
      }
      img.src = bgUrl
    } else {
      ctx.fillStyle = 'var(--color-bg-secondary, #f5f5f4)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = 'var(--color-text-tertiary, #9e9e99)'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Capture a photo first, then sign here with mouse or touch', W / 2, H / 2)
      ctx.textAlign = 'left'
    }
  }

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const onSigMouseDown = useCallback((e) => {
    if (!photoDataUrl) return
    setIsDrawing(true)
    setHasSig(true)
    const pos = getPos(e, sigCanvasRef.current)
    lastPos.current = pos
  }, [photoDataUrl])

  const onSigMouseMove = useCallback((e) => {
    if (!isDrawing || !sigCanvasRef.current) return
    const canvas = sigCanvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1a4fff'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }, [isDrawing])

  const onSigEnd = useCallback(() => setIsDrawing(false), [])

  function clearSignature() {
    setHasSig(false)
    initSigCanvas(photoDataUrl)
  }

  // ── Blob Merge ─────────────────────────────────────────
  // Creates a new offscreen canvas, draws the photo, then draws the sig on top
  function mergeAndSave() {
    if (!photoDataUrl) { alert('Capture a photo first'); return }
    if (!hasSig) { alert('Please sign on the canvas first'); return }

    const sigCanvas = sigCanvasRef.current
    const offscreen = document.createElement('canvas')
    offscreen.width = sigCanvas.width
    offscreen.height = sigCanvas.height
    const ctx = offscreen.getContext('2d')

    const photo = new Image()
    photo.onload = () => {
      // 1. Draw photo as background
      ctx.drawImage(photo, 0, 0, offscreen.width, offscreen.height)
      // 2. Draw signature layer on top (already composited in sigCanvas)
      ctx.drawImage(sigCanvas, 0, 0)

      // 3. Add employee name watermark
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillRect(0, offscreen.height - 28, offscreen.width, 28)
      ctx.fillStyle = '#111'
      ctx.font = '12px sans-serif'
      ctx.fillText(
        `${emp?.name || emp?.employee_name || 'Employee'} · ${new Date().toLocaleString()}`,
        8, offscreen.height - 9
      )

      // 4. Convert to base64 PNG blob
      const merged = offscreen.toDataURL('image/png')
      saveMergedImage(merged)
      setMergeMsg('Merged successfully! Go to Analytics to view the audit image.')
    }
    photo.src = photoDataUrl
  }

  if (!emp) {
    return (
      <div style={{ padding: 32, color: 'var(--color-text-secondary)' }}>
        No employee selected. <a href="/list">Go to list</a>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => navigate('/list')} className={styles.back}>← Back to list</button>
        <h1 className={styles.title}>Identity Verification</h1>
      </div>

      <div className={styles.grid}>
        {/* Employee info card */}
        <div className="card">
          <p className={styles.cardTitle}>Employee details</p>
          <div className={styles.avatar}>
            {(emp.name || emp.employee_name || 'E').charAt(0).toUpperCase()}
          </div>
          <h2 className={styles.empName}>{emp.name || emp.employee_name}</h2>
          <table className={styles.infoTable}>
            <tbody>
              <tr><td>ID</td><td>{emp.id}</td></tr>
              <tr><td>City</td><td>{emp.city || '—'}</td></tr>
              <tr><td>Department</td><td><span className="tag">{emp.department || 'Staff'}</span></td></tr>
              <tr><td>Salary</td><td>₹{Number(emp.salary || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Email</td><td>{emp.email || '—'}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Camera card */}
        <div className="card">
          <p className={styles.cardTitle}>Camera capture</p>

          {camState === 'idle' && !photoDataUrl && (
            <div className={styles.camPlaceholder}>
              <div className={styles.camIcon}>📷</div>
              <p>Click Start Camera to begin</p>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
            style={{ display: camState === 'active' ? 'block' : 'none' }}
          />

          <canvas
            ref={snapCanvasRef}
            className={styles.snapCanvas}
            style={{ display: camState === 'captured' ? 'block' : 'none' }}
          />

          <div className={styles.camControls}>
            {camState === 'idle' && (
              <button onClick={startCamera} className="primary">Start camera</button>
            )}
            {camState === 'active' && (
              <>
                <button onClick={capturePhoto} className="primary">Capture photo</button>
                <button onClick={stopCamera}>Cancel</button>
              </>
            )}
            {camState === 'captured' && (
              <button onClick={retakePhoto}>Retake</button>
            )}
          </div>
        </div>

        {/* Signature canvas - full width */}
        <div className={`card ${styles.sigCard}`}>
          <p className={styles.cardTitle}>Signature overlay</p>
          <p className={styles.sigHint}>
            {photoDataUrl
              ? 'Draw your signature over the photo using mouse or touch'
              : 'Capture a photo first, then sign here'}
          </p>
          <canvas
            ref={sigCanvasRef}
            className={styles.sigCanvas}
            style={{ cursor: photoDataUrl ? 'crosshair' : 'not-allowed' }}
            onMouseDown={onSigMouseDown}
            onMouseMove={onSigMouseMove}
            onMouseUp={onSigEnd}
            onMouseLeave={onSigEnd}
            onTouchStart={e => { e.preventDefault(); onSigMouseDown(e) }}
            onTouchMove={e => { e.preventDefault(); onSigMouseMove(e) }}
            onTouchEnd={onSigEnd}
          />
          <div className={styles.sigControls}>
            <button onClick={clearSignature} disabled={!photoDataUrl}>Clear signature</button>
            <button onClick={mergeAndSave} className="primary" disabled={!photoDataUrl || !hasSig}>
              Merge &amp; save audit image
            </button>
          </div>
          {mergeMsg && <p className={styles.mergeMsg}>{mergeMsg}</p>}
        </div>
      </div>
    </div>
  )
}
