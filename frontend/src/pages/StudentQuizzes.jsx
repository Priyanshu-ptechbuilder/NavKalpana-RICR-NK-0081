import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentQuizzes.css';
import '../styles/StudentDashboard.css'; // Reusing nav styles

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz implementation states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(null);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get('/student/quizzes');
      setQuizzes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  const startQuiz = async (quizId) => {
    try {
      const { data } = await axiosInstance.get(`/student/quizzes/${quizId}`);
      setActiveQuiz(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(data.duration * 60);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  const submitQuiz = useCallback(async () => {
    if (!activeQuiz) return;
    try {
      const { data } = await axiosInstance.post(`/student/quizzes/${activeQuiz._id}/attempt`, {
        answers
      });
      setShowResult(data);
      setActiveQuiz(null);
      fetchQuizzes(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  }, [activeQuiz, answers]);

  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) {
      if (timeLeft === 0 && activeQuiz) submitQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft, submitQuiz]);

  const selectOption = (questionIndex, selectedOption) => {
    setAnswers(prev => {
      const newAnswers = prev.filter(a => a.questionIndex !== questionIndex);
      return [...newAnswers, { questionIndex, selectedOption }];
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="student-quizzes-page"><div className="spinner"></div><p>Fetching your quizzes...</p></div>
  );

  return (
    <div className="student-quizzes-page">
      {!activeQuiz && (
          <>
            <nav className="student-nav">
                <div className="nav-logo">NavKalpana Student</div>
                <div className="nav-links">
                <Link to="/student/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/student/assignments" className="nav-item">Assignments</Link>
                <Link to="/student/quizzes" className="nav-item active">Quizzes</Link>
                <Link to="/student/attendance" className="nav-item">Attendance</Link>
                <button onClick={handleLogout} className="logout-btn-nav">Logout</button>
                </div>
            </nav>

            <header className="quizzes-header">
                <h1>Quizzes</h1>
                <p>Test your knowledge and improve your OGI score.</p>
            </header>

            <div className="quizzes-grid">
                {quizzes.map(quiz => (
                    <div key={quiz._id} className="quiz-card">
                        <div className="quiz-info">
                            <h3>{quiz.title}</h3>
                            <div className="quiz-meta">
                                <span>⏲️ {quiz.duration} mins</span>
                                <span>📋 {quiz.totalMarks} Marks</span>
                                <span>📚 {quiz.lesson || 'General'}</span>
                            </div>
                            {quiz.attemptsCount > 0 && <p className="stats-text text-success">Highest Score: {quiz.bestScore} / {quiz.totalMarks}</p>}
                        </div>
                        <button 
                            className="attempt-btn" 
                            disabled={!quiz.canAttempt}
                            onClick={() => startQuiz(quiz._id)}
                        >
                            {quiz.canAttempt ? 'Start Attempt' : 'Attempt Limit Reached'}
                        </button>
                    </div>
                ))}
            </div>
          </>
      )}

      {/* QUIZ INTERFACE OVERLAY */}
      {activeQuiz && (
          <div className="quiz-overlay">
              <div className="quiz-ui-header">
                  <div>
                      <h2>{activeQuiz.title}</h2>
                      <p>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</p>
                  </div>
                  <div className="timer-box">{formatTime(timeLeft)}</div>
              </div>

              <div className="quiz-content">
                  <div className="question-box">
                      <p className="question-text">{activeQuiz.questions[currentQuestionIndex].questionText}</p>
                      <div className="options-list">
                          {activeQuiz.questions[currentQuestionIndex].options.map((opt, i) => (
                              <div 
                                className={`option-item ${answers.find(a => a.questionIndex === currentQuestionIndex)?.selectedOption === i ? 'selected' : ''}`}
                                key={i}
                                onClick={() => selectOption(currentQuestionIndex, i)}
                              >
                                  <span className="bullet">{String.fromCharCode(65 + i)})</span>
                                  {opt}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="quiz-footer">
                  <button 
                    className="nav-btn-secondary" 
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button 
                        className="nav-btn-primary"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                        Next Question
                    </button>
                  ) : (
                    <button className="submit-btn-quiz" onClick={submitQuiz}>Submit Quiz</button>
                  )}
              </div>
          </div>
      )}

      {/* RESULT MODAL */}
      {showResult && (
          <div className="score-result-overlay">
              <div className="result-card">
                  <div className="score-circle">{showResult.score} / {showResult.totalMarks}</div>
                  <h2>Quiz Submitted!</h2>
                  <p>Your performance has been recorded and your OGI has been recalculated.</p>
                  <button className="close-btn" onClick={() => setShowResult(null)}>Return to Quizzes</button>
              </div>
          </div>
      )}
    </div>
  );
}
