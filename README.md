# NavKalpana Academic Management Portal (Multi-Role)

A comprehensive, secure, and centralized academic management system built with the MERN stack. This portal facilitates seamless interaction between Administrators, Teachers, and Students, streamlining academic operations from batch management to interactive learning.

## 🚀 Recent Updates: Role-Based Access Control (RBAC)
The portal has been upgraded from a teacher-only system to a robust multi-role ecosystem:
- **Admin**: Full system control, faculty & student lifecycle management.
- **Teacher**: Academic delivery, attendance, assignments, and quizzes.
- **Student**: Interactive learning, attendance tracking, and performance analytics.

---

## 🛠 Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Recharts, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Middleware.

---

## 🔐 Credentials & Role Gates

| Role | Access URL | Default Login | Initial Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `/admin/login` | `admin@navkalpana.com` | `admin123` |
| **Teacher** | `/teacher/login` | *Created by Admin* | *Set by Admin* |
| **Student** | `/student/login` | *Created by Admin* | *Set by Admin* |

---

## 📂 Key Module Breakdown

### 1. Admin Control Center (Violet Theme)
- **Teacher Management**: Full CRUD operations for faculty members.
- **Student Lifecycle**: Onboarding students and mapping them to batches.
- **System Health**: Overview of total users and system status.

### 2. Teacher Portal (Indigo Theme)
- **Batch Management**: Progress tracking and schedule monitoring.
- **Attendance**: Marking student presence with mandatory remarks and history logs.
- **Assessments**: Creation and evaluation of MCQ Quizzes and Digital Assignments.

### 3. Student Panel (Emerald Theme)
- **Dashboard**: Real-time stats and upcoming academic deadlines.
- **Attendance Registry**: Personal attendance calendar with performance summaries.
- **Assessment Gateway**: Interactive quiz attempt mode and assignment submission logs.
- **Competence Matrix**: Visual analytics of academic growth using trend line charts.

---

## ⚙️ Installation & Setup

### 1. Clone & Dependencies
```bash
git clone https://github.com/Priyanshu-ptechbuilder/NavKalpana-RICR-NK-0081.git
cd NavKalpana-RICR-NK-0081
```

### 2. Backend Initialization
```bash
cd backend
npm install
# Configure .env with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Database Seeding (Required for Admin Access)
```bash
# Run from the backend directory
node src/seed/adminSeed.js
```

### 4. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Improved File Structure
```text
NavKalpana-RICR-NK-0081/
├── backend/src/
│   ├── models/ (Student, Teacher, Batch, Quiz, etc.)
│   ├── routes/ (adminRoutes, studentRoutes, authRoutes, etc.)
│   ├── controllers/ (adminController, studentController, etc.)
│   └── seed/ (adminSeed.js)
└── frontend/src/
    ├── auth/ (AdminLogin, StudentLogin)
    ├── admin/ (AdminLayout, AdminDashboard, Teachers, Students)
    ├── student/ (StudentLayout, Dashboard, Attendance, Quizzes, etc.)
    └── components/ (ProtectedRoute, Layouts)
```

---

## 📊 Evaluation & Metrics
- All dashboard values are derived from live MongoDB aggregations.
- Performance charts utilize `recharts` for accurate visual representations.
- Real-time feedback provided via `react-hot-toast`.

---

⭐ **Project handled by Senior MERN Stack Team.**
