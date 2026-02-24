import { useState, useMemo } from 'react';
import '../styles/Page.css';
import '../styles/Support.css';

const DUMMY_REQUESTS = [
  { id: '1', studentName: 'Rahul Sharma', course: 'Web Development', topic: 'React Hooks', description: 'I am not able to understand how useEffect dependency array works. Can you explain with an example?', attachment: 'screenshot.png', status: 'pending', createdAt: '2025-02-20', replies: [] },
  { id: '2', studentName: 'Priya Singh', course: 'Data Structures', topic: 'Binary Trees', description: 'Stuck on implementing level-order traversal. Need help with the queue approach.', attachment: null, status: 'resolved', createdAt: '2025-02-18', replies: [{ text: 'Please refer to the solution file attached.', by: 'Teacher', at: '2025-02-19' }] },
  { id: '3', studentName: 'Amit Kumar', course: 'Web Development', topic: 'API Integration', description: 'Getting CORS error when calling backend from frontend.', attachment: 'error-log.txt', status: 'pending', createdAt: '2025-02-21', replies: [] },
  { id: '4', studentName: 'Sneha Patel', course: 'Database Systems', topic: 'MongoDB Aggregation', description: 'Need help writing an aggregation pipeline for counting documents by category.', attachment: null, status: 'pending', createdAt: '2025-02-22', replies: [] },
];

export default function Support() {
  const [requests, setRequests] = useState(DUMMY_REQUESTS);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const courses = useMemo(() => {
    const set = new Set(requests.map((r) => r.course));
    return Array.from(set).sort();
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filterCourse && r.course !== filterCourse) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (searchStudent.trim() && !r.studentName.toLowerCase().includes(searchStudent.trim().toLowerCase())) return false;
      if (searchTopic.trim() && !r.topic.toLowerCase().includes(searchTopic.trim().toLowerCase())) return false;
      return true;
    });
  }, [requests, filterCourse, filterStatus, searchStudent, searchTopic]);

  const handleMarkResolved = (id) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
    setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, status: 'resolved' } : prev));
    setActionMessage('Marked as resolved.');
  };

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    const newReply = { text: replyText.trim(), by: 'Teacher', at: new Date().toISOString().slice(0, 10) };
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, replies: [...(r.replies || []), newReply] } : r)));
    setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, replies: [...(prev.replies || []), newReply] } : prev));
    setReplyText('');
    setActionMessage('Reply added.');
  };

  const handleUploadSolution = () => {
    setActionMessage('Solution upload is not implemented yet. Use reply to share solution text or links.');
  };

  const handleScheduleBackup = () => {
    setActionMessage('Backup class scheduling is not implemented yet.');
  };

  return (
    <div className="page support-page">
      <h1>Support Requests</h1>

      <section className="support-section support-filters">
        <h2>Filters</h2>
        <div className="filter-row">
          <label>
            Course
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="filter-select">
              <option value="">All</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <label>
            Student name
            <input type="text" value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} placeholder="Search by name" className="filter-input" />
          </label>
          <label>
            Topic
            <input type="text" value={searchTopic} onChange={(e) => setSearchTopic(e.target.value)} placeholder="Search by topic" className="filter-input" />
          </label>
        </div>
      </section>

      <section className="support-section support-list-section">
        <h2>Requests ({filteredRequests.length})</h2>
        {filteredRequests.length === 0 ? (
          <p className="support-empty">No support requests match the filters.</p>
        ) : (
          <div className="support-cards">
            {filteredRequests.map((req) => (
              <div key={req.id} className="support-card" onClick={() => setSelectedRequest(req)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedRequest(req)}>
                <div className="support-card-header">
                  <span className="support-card-student">{req.studentName}</span>
                  <span className={`support-card-status status-${req.status}`}>{req.status}</span>
                </div>
                <div className="support-card-meta">
                  <span>{req.course}</span>
                  <span className="support-card-topic">{req.topic}</span>
                </div>
                <p className="support-card-desc">{req.description.length > 100 ? `${req.description.slice(0, 100)}...` : req.description}</p>
                {req.attachment && (
                  <div className="support-card-attachment">
                    <span className="attachment-icon">&#128206;</span> {req.attachment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Details</h3>
              <button type="button" className="modal-close" onClick={() => setSelectedRequest(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><strong>Student:</strong> {selectedRequest.studentName}</div>
              <div className="detail-row"><strong>Course:</strong> {selectedRequest.course}</div>
              <div className="detail-row"><strong>Topic:</strong> {selectedRequest.topic}</div>
              <div className="detail-row"><strong>Status:</strong> <span className={`status-badge status-${selectedRequest.status}`}>{selectedRequest.status}</span></div>
              <div className="detail-block"><strong>Description</strong><p>{selectedRequest.description}</p></div>
              {selectedRequest.attachment && (
                <div className="detail-block"><strong>Attachment</strong><div className="attachment-preview"><span className="attachment-icon">&#128206;</span> {selectedRequest.attachment} (preview not available)</div></div>
              )}
              {(selectedRequest.replies || []).length > 0 && (
                <div className="detail-block">
                  <strong>Replies</strong>
                  <ul className="replies-list">
                    {selectedRequest.replies.map((rep, i) => (
                      <li key={i}><span className="reply-meta">{rep.by} &middot; {rep.at}</span><p>{rep.text}</p></li>
                    ))}
                  </ul>
                </div>
              )}
              {actionMessage && <p className="action-message">{actionMessage}</p>}
              <div className="detail-block">
                <label><strong>Reply to doubt</strong>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} className="reply-textarea" />
                </label>
                <button type="button" className="btn-primary" onClick={() => handleReply(selectedRequest.id)}>Send Reply</button>
              </div>
              <div className="teacher-actions">
                <button type="button" className="btn-secondary" onClick={handleUploadSolution}>Upload solution file</button>
                {selectedRequest.status === 'pending' && <button type="button" className="btn-success" onClick={() => handleMarkResolved(selectedRequest.id)}>Mark as resolved</button>}
                <button type="button" className="btn-secondary" onClick={handleScheduleBackup}>Schedule backup class</button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
