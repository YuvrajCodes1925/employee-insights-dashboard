
# Employee Insights Dashboard

A lightweight, full-stack-feeling **React dashboard** built without any UI libraries. Every core feature is hand-implemented:
- Virtualized employee table (no `react-window`)
- SVG salary chart (no D3/Chart.js)
- Camera + canvas signatures (no external drawing libs)
- Leaflet map with a static city→coordinate lookup (no geocoding API)

---

## 🚀 Live Demo / Recording

A short screen recording walks through the full user journey:
1. Login (`testuser` / `Test123`)
2. Browse the virtualized employee list
3. Capture a photo + sign on the Details page
4. View the merged image + analytics view

> 📌 **Tip:** You can record the flow yourself by running `npm run dev` and capturing your browser window.

---

## 📦 Source Code

This repository contains the full source code for the dashboard:

- GitHub: https://github.com/YuvrajCodes1925/employee-dashboard

---

## ✅ Setup & Run

```bash
npm install
npm run dev
```

Then open: **http://localhost:5173**

Credentials:
- **Username:** `testuser`
- **Password:** `Test123`

---

## 🧠 What’s the Intentional Bug (Assignment Requirement)

The “intentional bug” lives in **`src/components/VirtualTable.jsx`**, inside the scroll handler.

### What it is
The `onScroll` handler is memoized with an empty dependency array (`useCallback(..., [])`), so it captures a **stale reference** to the `scrollTop` state.

### What happens
When you scroll quickly, React batches state updates. The component uses the **previous** `scrollTop` value to compute which rows to render, so the visible rows can briefly lag behind the actual scroll position (you’ll see rows render one frame behind).

### Why I chose it
This bug is subtle: it works fine at slow scroll speeds and only misbehaves under fast scrolling. It’s also a very common real-world pitfall in React when you memoize callbacks without including all dependencies — a great teachable moment for React’s render lifecycle and stale closures.

### Where it is
**File:** `src/components/VirtualTable.jsx` (the `onScroll` callback)

### How to fix it (not applied intentionally)
Instead of keeping `scrollTop` in state, read it directly from the DOM each render via:

```js
const scrollTop = containerRef.current?.scrollTop ?? 0
```

This ensures the row calculation always uses the live scroll position.

---

## 📐 Virtualization Math (How the table stays fast)

The table only renders the rows that are visible plus a small buffer above & below. This keeps DOM node count low even for large datasets.

### Core numbers
- **Row height:** `52px`
- **Buffer:** `6` rows (rendered above/below the viewport)

### How it works (each frame / scroll event)
1. Read the scrolling state from the DOM:
   - `scrollTop = container.scrollTop`
   - `viewHeight = container.clientHeight`
2. Figure out which slice of rows should be visible:
   - `startIndex = max(0, floor(scrollTop / ROW_HEIGHT) - BUFFER)`
   - `endIndex = min(totalRows, ceil((scrollTop + viewHeight) / ROW_HEIGHT) + BUFFER)`
3. Render only `rows.slice(startIndex, endIndex)`.

### Why it works
A spacer `<div>` with `height: totalRows * ROW_HEIGHT` keeps the scrollbar accurate. Inside it, only the “window” of visible rows is rendered using absolutely positioned row elements, so the browser never has to manage thousands of DOM nodes simultaneously.

---

## 👨‍💻 Author
**Yuvraj Singh**

- GitHub: https://github.com/YuvrajCodes1925
- LinkedIn: https://www.linkedin.com/in/yuvraj-singh-276976266/
- Email: ysbhati1925@gmail.com

---

## 🧩 Project Structure (Quick Reference)

```
src/
  context/
    AuthContext.jsx       — persistent auth (Context API + localStorage)
    EmployeeContext.jsx   — employee data, fetch, selected emp, merged image
  components/
    Navbar.jsx            — sticky nav with active route highlighting
    PrivateRoute.jsx      — redirect unauthenticated users to /login
    VirtualTable.jsx      — custom scroll virtualization (no react-window)
    SalaryChart.jsx       — salary bar chart in raw SVG (no D3/Chart.js)
    CityMap.jsx           — Leaflet map with static city→coordinate table
  pages/
    Login.jsx             — auth form
    List.jsx              — searchable/filterable virtual employee table
    Details.jsx           — camera capture + canvas signature + blob merge
    Analytics.jsx         — audit image + SVG chart + map
  App.jsx                 — routes + providers
  main.jsx                — entry point
  index.css               — design tokens + global styles (no Tailwind/Bootstrap)
```

---

## ✅ Hard Constraints Met

| Constraint | Status |
|---|---|
| Zero UI libraries (MUI, Ant, Bootstrap) | ✅ Raw CSS modules only |
| Zero virtualization libraries (react-window) | ✅ Custom scroll math |
| Intentional documented bug | ✅ Stale closure in VirtualTable |
| Persistent auth (Context + localStorage) | ✅ AuthContext |
| Route protection (/list redirects if unauthenticated) | ✅ PrivateRoute |
| Session persists on refresh | ✅ localStorage check in useState initializer |
| Camera API | ✅ getUserMedia |
| Canvas signature (mouse + touch) | ✅ pointer events on canvas |
| Blob merge (photo + signature) | ✅ offscreen canvas drawImage |
| Custom SVG chart (no D3/Chart.js) | ✅ SalaryChart.jsx |
| Geospatial map | ✅ Leaflet + static coords |
