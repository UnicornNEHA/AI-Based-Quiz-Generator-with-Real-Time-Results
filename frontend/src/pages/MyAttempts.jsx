import { useEffect, useState } from "react";
import axios from "axios";

export default function MyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/quizzes/attempts/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAttempts(response.data);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch attempts");
      }
    };

    fetchAttempts();
  }, [token]);

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>My Quiz Attempts</h2>
      {attempts.length === 0 ? (
        <p>No attempts yet</p>
      ) : (
        <ul>
          {attempts.map((a) => (
            <li key={a._id} style={{ margin: "10px 0" }}>
              <strong>{a.quiz.title}</strong> - Score: {a.score}/{a.totalQuestions} <br />
              <small>Attempted on: {new Date(a.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
