import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Attendance.css';

const EDIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function formatDateForInput(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return formatDateForInput(new Date());
}

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get('batch') || '';
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(batchFromUrl);
  const [sessionDate, setSessionDate] = useState(todayStr());
  const [moduleFilter, setModuleFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [rowData, setRowData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch batches error:', err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (batchFromUrl) setSelectedBatch(batchFromUrl);
  }, [batchFromUrl]);

  useEffect(() => {
    if (!selectedBatch || !sessionDate) {
      setStudents([]);
      setExistingAttendance([]);
      setRowData({});
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          axiosInstance.get('/students', { params: { batch: selectedBatch } }),
          axiosInstance.get('/attendance', { params: { batch: selectedBatch, date: sessionDate } }),
        ]);
        const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const attendanceList = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
        setStudents(studentList);
        setExistingAttendance(attendanceList);

        const byStudent = {};
        attendanceList.forEach((a) => {
          const sid = typeof a.student === 'object' ? a.student._id : a.student;
          byStudent[sid] = { id: a._id, status: a.status, remarks: a.remarks || '', createdAt: a.createdAt };
        });
        const initial = {};
        studentList.forEach((s) => {
          if (byStudent[s._id]) {
            initial[s._id] = {
              status: byStudent[s._id].status,
              remarks: byStudent[s._id].remarks,
              attendanceId: byStudent[s._id].id,
              createdAt: byStudent[s._id].createdAt,
            };
          } else {
            initial[s._id] = { status: 'present', remarks: '', attendanceId: null, createdAt: null };
          }
        });
        setRowData(initial);
      } catch (err) {
        console.error('Attendance fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
        setStudents([]);
        setExistingAttendance([]);
        setRowData({});
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedBatch, sessionDate]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.trim().toLowerCase();
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        ((s.enrollmentNo || s.enrollmentId) || '').toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const canEditRow = (studentId) => {
    const row = rowData[studentId];
    if (!row || !row.attendanceId || !row.createdAt) return true;
    const isToday = sessionDate === todayStr();
    if (!isToday) return false;
    const created = new Date(row.createdAt).getTime();
    return Date.now() - created <= EDIT_WINDOW_MS;
  };

  const updateRow = (studentId, field, value) => {
    setRowData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const savePromises = filteredStudents.map((s) => {
        const r = rowData[s._id];
        if (!r) return null;
        const status = r.status || 'present';
        const remarks = String(r.remarks || '').trim();

        if (r.attendanceId && canEditRow(s._id)) {
          return axiosInstance.put(`/attendance/${r.attendanceId}`, { status, remarks }).catch(e => {
            console.error(`Error updating student ${s.name}:`, e);
            throw e;
          });
        } else if (!r.attendanceId) {
          return axiosInstance.post('/attendance', {
            student: s._id,
            batch: selectedBatch,
            date: sessionDate,
            status,
            remarks,
          }).catch(e => {
            console.error(`Error marking student ${s.name}:`, e);
            throw e;
          });
        }
        return null;
      }).filter(Boolean);

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }
      setError('');
      
      const [attendanceRes, studentsRes] = await Promise.all([
        axiosInstance.get('/attendance', {
          params: { batch: selectedBatch, date: sessionDate },
        }),
        axiosInstance.get('/students', {
          params: { batch: selectedBatch },
        })
      ]);
      const attendanceList = attendanceRes.data;
      const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(studentList);
      
      const byStudent = {};
      (attendanceList || []).forEach((a) => {
        const sid = typeof a.student === 'object' ? a.student._id : a.student;
        byStudent[sid] = { id: a._id, status: a.status, remarks: a.remarks || '', createdAt: a.createdAt };
      });
      setRowData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sid) => {
          if (byStudent[sid]) {
            next[sid] = {
              ...next[sid],
              status: byStudent[sid].status,
              remarks: byStudent[sid].remarks,
              attendanceId: byStudent[sid].id,
              createdAt: byStudent[sid].createdAt,
            };
          }
        });
        return next;
      });
      setExistingAttendance(attendanceList || []);
      setSuccessMsg('Attendance saved successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Submit attendance error:', err);
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkStatus = (status) => {
    setRowData((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((s) => {
        if (next[s._id]) next[s._id] = { ...next[s._id], status };
      });
      return next;
    });
  };

  const buildExportData = () => {
    const headers = ['Student Name', 'Enrollment ID', 'Attendance %', 'Status', 'Remarks'];
    const rows = filteredStudents.map((s) => {
      const r = rowData[s._id] || {};
      const pct = s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—';
      return [s.name, s.enrollmentNo || s.enrollmentId, pct, r.status || '', r.remarks || ''];
    });
    return [headers, ...rows];
  };

  const handleExportCSV = () => {
    const data = buildExportData();
    const csv = data.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${sessionDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const data = buildExportData();
    const BOM = '\uFEFF';
    const csv = BOM + data.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${sessionDate}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAttendanceClass = (pct) => {
    const n = Number(pct);
    if (n > 75) return 'attendance-high';
    if (n >= 50) return 'attendance-mid';
    return 'attendance-low';
  };

  return (
    <div className="page attendance-page">
      <h1>Attendance Management</h1>
      <p className="attendance-sync-note">
        Saved attendance updates each student’s Attendance % and syncs with Student Management and Dashboard KPIs.
      </p>

      <section className="attendance-section attendance-filter-section">
        <h2>Filters</h2>
        <div className="filter-row">
          <label>
            Batch
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="filter-select"
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Session Date
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="filter-input"
            />
          </label>
          <label>
            Module
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="m1">Module 1</option>
              <option value="m2">Module 2</option>
            </select>
          </label>
          <label>
            Search Student
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Name or enrollment ID"
              className="filter-input search-input"
            />
          </label>
        </div>
      </section>

      {!selectedBatch ? (
        <section className="attendance-section">
          <p className="attendance-hint">Select a batch and date to load students.</p>
        </section>
      ) : loading ? (
        <section className="attendance-section">
          <p className="attendance-loading">Loading...</p>
        </section>
      ) : (
        <>
          <section className="attendance-section attendance-table-section">
            <div className="table-header-row">
              <h2>Attendance</h2>
              <div className="table-actions">
                <button type="button" className="btn-secondary" onClick={() => handleBulkStatus('present')}>
                  Mark all Present
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleBulkStatus('absent')}>
                  Mark all Absent
                </button>
                <button type="button" className="btn-export" onClick={handleExportCSV}>
                  Export CSV
                </button>
                <button type="button" className="btn-export" onClick={handleExportExcel}>
                  Export Excel
                </button>
              </div>
            </div>
            {error && <p className="attendance-error">{error}</p>}
            {successMsg && <p className="attendance-success" style={{ color: '#10b981', fontWeight: 'bold', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '15px' }}>{successMsg}</p>}
            {filteredStudents.length === 0 ? (
              <p className="attendance-empty">No students in this batch.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="table-wrap">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Enrollment ID</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const r = rowData[s._id] || { status: 'present', remarks: '' };
                        const editable = canEditRow(s._id);
                        return (
                          <tr key={s._id}>
                            <td>{s.name}</td>
                            <td>{s.enrollmentNo || s.enrollmentId}</td>
                            <td>
                              <span className={`attendance-pct ${getAttendanceClass(s.attendancePercentage)}`}>
                                {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                              </span>
                            </td>
                            <td>
                              <select
                                value={r.status || 'present'}
                                onChange={(e) => updateRow(s._id, 'status', e.target.value)}
                                disabled={!editable}
                                className="status-select"
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={r.remarks || ''}
                                onChange={(e) => updateRow(s._id, 'remarks', e.target.value)}
                                placeholder="Remarks (optional)"
                                disabled={!editable}
                                className="remarks-input"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="submit-row">
                  <button type="submit" disabled={submitting} className="btn-submit">
                    {submitting ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
