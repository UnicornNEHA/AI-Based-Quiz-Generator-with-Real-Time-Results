import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const token = localStorage.getItem("token"); // JWT token

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/quizzes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuizzes(response.data);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch quizzes");
      }
    };

    fetchQuizzes();
  }, [token]);

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>Quiz Selection Page</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes available</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz._id} style={{ margin: "10px 0" }}>
              <Link
                to={`/quizzes/${quiz._id}`}
                style={{ textDecoration: "none", color: "blue" }}
              >
                <strong>{quiz.title}</strong> - {quiz.description}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
