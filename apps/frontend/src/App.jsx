import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import EmployeeDashboardPage from './pages/EmployeeDashboard.jsx';
import EmployeeCheckInPage from './pages/EmployeeCheckIn.jsx';
import EmployeeHistoryPage from './pages/EmployeeHistory.jsx';
import EmployeeAttendanceDetailPage from './pages/EmployeeAttendanceDetail.jsx';
import HrEmployeesPage from './pages/HrEmployees.jsx';
import HrAttendancePage from './pages/HrAttendance.jsx';
import HrEmployeeDetailPage from './pages/HrEmployeeDetail.jsx';
import HrEmployeeEditPage from './pages/HrEmployeeEdit.jsx';
import HrAttendanceDetailPage from './pages/HrAttendanceDetail.jsx';
import { api } from './api/client.js';
import { clearToken, decodeJwt, getToken, saveToken } from './auth/session.js';

const EMPTY_USER = { id: null, username: null, role: null, employeeId: null, employeeCode: null };

function roleHomePath(role) {
  if (role === 'HRD') return '/hr/employees';
  if (role === 'EMPLOYEE') return '/employee';
  return '/login';
}

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ user, allowed, children }) {
  if (!user?.role) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={roleHomePath(user.role)} replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeJwt(token);
    if (decoded?.role) {
      setUser({
        id: decoded.sub ?? null,
        username: decoded.username ?? null,
        role: decoded.role ?? null,
        employeeId: decoded.employeeId ?? null,
        employeeCode: null,
      });
      setLoading(false);
      return;
    }

    api
      .get('/me')
      .then((res) => {
        const payload = res?.data?.user ?? {};
        setUser({
          id: payload.userId ?? null,
          username: payload.username ?? null,
          role: payload.role ?? null,
          employeeId: payload.employeeId ?? null,
          employeeCode: payload.employeeCode ?? null,
        });
      })
      .catch(() => {
        clearToken();
        setUser(EMPTY_USER);
      })
      .finally(() => setLoading(false));
  }, []);

  const auth = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login: (token) => {
        saveToken(token);
        const decoded = decodeJwt(token) ?? {};
        setUser({
          id: decoded.sub ?? null,
          username: decoded.username ?? null,
          role: decoded.role ?? null,
          employeeId: decoded.employeeId ?? null,
          employeeCode: null,
        });
      },
      logout: () => {
        clearToken();
        setUser(EMPTY_USER);
      },
    }),
    [user, loading],
  );

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  const isAuthed = Boolean(user.role);
  const homePath = roleHomePath(user.role);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthed ? <Navigate to={homePath} replace /> : <LoginPage auth={auth} />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthed={isAuthed}>
            <Navigate to={homePath} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <RoleRoute user={user} allowed={['EMPLOYEE']}>
            <EmployeeDashboardPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/employee/check-in"
        element={
          <RoleRoute user={user} allowed={['EMPLOYEE']}>
            <EmployeeCheckInPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/employee/history"
        element={
          <RoleRoute user={user} allowed={['EMPLOYEE']}>
            <EmployeeHistoryPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/employee/history/:id"
        element={
          <RoleRoute user={user} allowed={['EMPLOYEE']}>
            <EmployeeAttendanceDetailPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <RoleRoute user={user} allowed={['HRD']}>
            <HrEmployeesPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/hr/employees/:id"
        element={
          <RoleRoute user={user} allowed={['HRD']}>
            <HrEmployeeDetailPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/hr/employees/:id/edit"
        element={
          <RoleRoute user={user} allowed={['HRD']}>
            <HrEmployeeEditPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/hr/attendances"
        element={
          <RoleRoute user={user} allowed={['HRD']}>
            <HrAttendancePage auth={auth} />
          </RoleRoute>
        }
      />
      <Route
        path="/hr/attendances/:id"
        element={
          <RoleRoute user={user} allowed={['HRD']}>
            <HrAttendanceDetailPage auth={auth} />
          </RoleRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthed ? homePath : '/login'} replace />} />
    </Routes>
  );
}
