import { Navigate } from 'react-router-dom'

/**
 * Route guard. Renders children only when the visitor is logged in and (when
 * `roles` is given) holds one of the allowed roles. Otherwise redirects.
 *
 * Note: this is a UX gate only — the backend still enforces every write with
 * its own role/ownership checks. A tampered localStorage cannot bypass the API.
 */
function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('token')
  const role = (localStorage.getItem('role') || '').toLowerCase()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
