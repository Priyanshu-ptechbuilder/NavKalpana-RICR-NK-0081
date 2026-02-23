<<<<<<< HEAD
📚 Academic Operations and Management Portal -- (Teacher Module – Part 1)

Project Title

Academic Operations and Management Portal – Teacher Module


👥 Team Members & Roles

| Name | Role | Responsibilities |
|------|------|-----------------|
| Team Member 1 | Backend Developer | API, Database, Authentication |
| Team Member 2 | Frontend Developer | UI, Components, Integration |
| Team Member 3 | Database & Logic | Schema Design, Data Flow |
| Team Member 4 | Testing & Documentation | Testing, Docs, Deployment |

📖 Problem Statement

Teachers often manage academic activities manually or across multiple disconnected platforms.  
This leads to:

- Poor tracking of attendance  
- Difficulty in evaluating assignments  
- Lack of centralized student performance monitoring  
- No structured batch management  

This project aims to build a **secure and centralized academic management portal** where teachers can:

- Manage batches  
- Track attendance  
- Create and evaluate assignments & quizzes  
- Monitor student progress  
- Handle support requests  


🎯 Objective

To create a structured and scalable system that:

- Provides secure authentication
- Allows structured academic management
- Tracks student performance effectively
- Improves academic monitoring and reporting


🛠 Tech Stack Used

### Frontend
- React.js
- Vite
- CSS / Tailwind (if used)

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT (JSON Web Token)
- Bcrypt (Password Hashing)


🔐 Core Features Implemented (Part 1)

1️⃣ Authentication Module
- Email & Password Login
- Role-based Access (Teacher)
- JWT Session Handling
- Password Hashing
- Logout Functionality

2️⃣ Dashboard
- Total Students
- Active Courses
- Pending Assignments
- Upcoming Deadlines
- Quick Navigation

3️⃣ Batch Management
- Batch Cards
- Progress Tracking
- Status (Ongoing / Completed / Upcoming)
- Batch Filtering
- Attendance Management

4️⃣ Attendance Management
- Mark Attendance
- Remarks (Mandatory)
- Edit within allowed time
- Attendance History
- Export Option
- Calendar View
- Present / Absent / Late Classification

5️⃣ Assessment Management
Assignment Module
- Create Assignment
- Set Deadline
- Upload Instructions
- Evaluate Submissions
- Marks & Feedback
- Status Tracking

Quiz Module
- Create MCQ Quiz
- Set Duration
- Attempt Limits
- View Scores
- Class Average

6️⃣ Student Management
- Search & Filter Students
- Student Detail Modal
- Progress Tracking
- Attendance Summary
- Performance Monitoring

7️⃣ Support Requests
- View Doubts
- Filter by Course
- Reply to Queries
- Upload Solution Files
- Mark as Resolved

📂 Project Folder Structure



NavKalpana-RICR-0081/
│
├── frontend/
├── backend/
├── docs/
│   ├── problem-statement.pdf
│   ├── architecture-diagram.png
│   ├── api-documentation.md
│   └── presentation.pptx
│
├── README.md
└── .gitignore



⚙ Installation Steps

1️⃣ Clone Repository



git clone https://github.com/Priyanshu-ptechbuilder/NavKalpana-RICR-NK-0081.git
cd NavKalpana-RICR-NK-0081

```

2️⃣ Backend Setup

```

cd backend
npm install
npm run dev

```

3️⃣ Frontend Setup

```

cd frontend
npm install
npm run dev


---

🔌 API Endpoints (Basic Overview)

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/auth/login | Teacher Login |
| GET | /api/dashboard | Dashboard Data |
| GET | /api/batches | Get All Batches |
| POST | /api/attendance | Mark Attendance |
| POST | /api/assignments | Create Assignment |
| POST | /api/quizzes | Create Quiz |
| GET | /api/students | Get Student List |
| GET | /api/support | Get Support Requests |

*(Detailed documentation available in docs/api-documentation.md)*


📊 Future Improvements

- Part 2 – Advanced Analytics & Growth Intelligence
- AI-based Performance Insights
- Automatic Low-Performance Alerts
- Role Expansion (Admin / Student)
- Real-time Notifications
- Deployment on AWS / Render / Vercel
- Email Notification System
- Advanced Report Export (PDF)

---

🧠 Innovation Aspect

This system improves academic operations by:

- Centralizing management
- Automating evaluation tracking
- Providing structured student monitoring
- Supporting scalable academic growth

---

🚀 Deployment (Planned)

- Frontend: Vercel / Netlify
- Backend: Render / AWS
- Database: MongoDB Atlas

---

📌 Notes

- Dummy data is used where required.
- Code follows modular and clean structure.
- All commits are meaningful and structured.
- Each team member contributes individually.

---

📢 Final Statement

This project is built with structured thinking, teamwork, and scalability in mind.  
It reflects real academic management needs and provides a practical solution for faculty operations.


⭐ Thank You
