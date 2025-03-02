import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const Button = ({ children, onClick, variant = "default" }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold text-white ";
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600",
    secondary: "bg-gray-500 hover:bg-gray-600",
  };
  return (
    <button
      className={`${baseStyle} ${variants[variant]} w-full my-2`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Card = ({ children }) => (
  <div className="mt-4 p-4 w-96 border rounded-lg shadow-lg bg-white">
    {children}
  </div>
);

const Globetrotter = () => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [timer, setTimer] = useState(15);
  const [difficulty, setDifficulty] = useState("Easy");
  const [username, setUsername] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    fetchQuestion();
  }, [difficulty]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (question && !result) {
      setResult({ correct: false, fun_fact: "Time's up! Try again." });
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  }, [timer, question, result]);

  const fetchQuestion = async () => {
    const response = await fetch(`http://localhost:8000/api/v1/globetrotter/random-destination?difficulty=${difficulty}`);
    const data = await response.json();
    setQuestion(data);
    setSelectedAnswer(null);
    setResult(null);
    setTimer(15);
  };

  const checkAnswer = async (answer) => {
    setSelectedAnswer(answer);
    const response = await fetch("http://localhost:8000/api/v1/globetrotter/check-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: question.id, answer }),
    });
    const data = await response.json();
    setResult(data);
    if (data.correct) {
      confetti();
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const generateInviteLink = () => {
    const link = `http://localhost:5173/play?user=${encodeURIComponent(username)}`;
    setInviteLink(link);
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🌍 Globetrotter Challenge</h1>
      <div className="mb-4 text-lg font-semibold">Score: ✅ {score.correct} | ❌ {score.incorrect}</div>
      <div className="mb-4">Time Left: ⏳ {timer} seconds</div>
      <div className="mb-4">
        <label className="mr-2">Difficulty:</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="p-2 border rounded">
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <Button onClick={generateInviteLink}>Challenge a Friend</Button>
        {inviteLink && <p className="mt-2">Share this link: <a href={inviteLink} className="text-blue-500 underline">{inviteLink}</a></p>}
      </div>
      {question && (
        <Card>
          <p className="mb-4 text-lg">{question.clues.slice(0, 2).join(" ")}</p>
          {question.options.map((option) => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "secondary" : "default"}
              onClick={() => checkAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </Card>
      )}
      {result && (
        <motion.div
          className="mt-4 text-lg text-center p-4 bg-white rounded-lg shadow-md w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className={result.correct ? "text-green-600" : "text-red-600"}>
            {result.correct ? "🎉 Correct!" : "😢 Incorrect!"}
          </p>
          <p className="mt-2 text-gray-700">{result.fun_fact}</p>
          <Button onClick={fetchQuestion}>Play Again</Button>
        </motion.div>
      )}
    </div>
  );
};

export default Globetrotter;
