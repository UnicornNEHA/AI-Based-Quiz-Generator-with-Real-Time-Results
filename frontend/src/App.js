import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuizList from "./pages/QuizList";
import QuizAttempt from "./pages/QuizAttempt";
import MyAttempts from "./pages/MyAttempts";

function App() {
  return (
    <BrowserRouter>
      {/* Simple navigation links */}
      <div style={{ textAlign: "center", margin: "20px" }}>
        <Link to="/">Login</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/quizzes">Quizzes</Link> |{" "}
        <Link to="/my-attempts">My Attempts</Link>
      </div>

      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Quiz selection page */}
        <Route path="/quizzes" element={<QuizList />} />

        {/* Quiz attempt page */}
        <Route path="/quizzes/:quizId" element={<QuizAttempt />} />

        {/* User attempts page */}
        <Route path="/my-attempts" element={<MyAttempts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
