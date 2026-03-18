"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { HelpCircle, LogOut, CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  answered: boolean;
  correctAnswerIndex?: number;
  selectedAnswerIndex?: number;
  isCorrect?: boolean;
}

export default function QuizEmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <QuizEmbed />
    </Suspense>
  );
}

function QuizEmbed() {
  const searchParams = useSearchParams();
  const grade = searchParams.get("grade");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradeHebrew, setGradeHebrew] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [quizPoints, setQuizPoints] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loginId, setLoginId] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!grade) {
      setError("לא צוין מספר כיתה");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/embed/quiz?grade=${grade}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGradeHebrew(data.grade);
        setTotalQuestions(data.totalQuestions);
        setLoggedIn(data.loggedIn);
        setStudentName(data.studentName || "");
        setQuizPoints(data.quizPoints || 0);
        setQuestions(data.questions || []);
      }
    } catch {
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }, [grade]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) return;

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/embed/quiz/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ israeliId: loginId, grade }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "שגיאה בהתחברות");
      } else {
        setLoginId("");
        setLoading(true);
        await loadQuiz();
      }
    } catch {
      setLoginError("שגיאת חיבור");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/embed/quiz/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade }),
    });
    setLoggedIn(false);
    setStudentName("");
    setQuestions([]);
    setQuizPoints(0);
  };

  const handleAnswer = async (questionId: string, selectedIndex: number) => {
    setSubmitting(questionId);

    try {
      const res = await fetch("/api/embed/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedAnswerIndex: selectedIndex,
          grade,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answered: true,
                  selectedAnswerIndex: selectedIndex,
                  isCorrect: data.isCorrect,
                  correctAnswerIndex: data.correctAnswerIndex,
                }
              : q
          )
        );
        if (data.isCorrect) {
          setQuizPoints((p) => p + 1);
        }
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">{error}</div>
    );
  }

  // Not logged in: show login form
  if (!loggedIn) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <HelpCircle size={32} className="text-blue-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold">
            כיתה {gradeHebrew}׳ - {totalQuestions} שאלות
          </h2>
        </div>

        <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-3">
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="הקלד תעודת זהות"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            inputMode="numeric"
            dir="ltr"
          />
          {loginError && (
            <p className="text-red-500 text-sm text-center">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loginLoading ? "מתחבר..." : "כניסה"}
          </button>
        </form>
      </div>
    );
  }

  // Logged in: show questions
  const answeredCount = questions.filter((q) => q.answered).length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg">{studentName}</h2>
          <p className="text-sm text-gray-500">
            {quizPoints} נקודות חידון • {answeredCount}/{questions.length} שאלות
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>יציאה</span>
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="font-medium mb-3">
              {qIdx + 1}. {q.text}
            </p>

            {q.answered ? (
              // Answered state
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const isSelected = idx === q.selectedAnswerIndex;
                  const isCorrect = idx === q.correctAnswerIndex;
                  let classes =
                    "px-3 py-2 rounded-lg text-sm border ";
                  if (isCorrect) {
                    classes +=
                      "bg-green-50 border-green-300 text-green-800";
                  } else if (isSelected && !q.isCorrect) {
                    classes +=
                      "bg-red-50 border-red-300 text-red-800";
                  } else {
                    classes += "border-gray-200 text-gray-500";
                  }

                  return (
                    <div key={idx} className={`flex items-center gap-2 ${classes}`}>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle size={16} className="text-green-600" />}
                      {isSelected && !q.isCorrect && <XCircle size={16} className="text-red-500" />}
                    </div>
                  );
                })}
                <p className={`text-sm font-medium mt-1 ${q.isCorrect ? "text-green-600" : "text-red-500"}`}>
                  {q.isCorrect ? "תשובה נכונה! +1 נקודה" : "תשובה שגויה"}
                </p>
              </div>
            ) : (
              // Unanswered state
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(q.id, idx)}
                    disabled={submitting === q.id}
                    className="w-full text-start px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין שאלות זמינות כרגע
          </p>
        )}
      </div>
    </div>
  );
}
