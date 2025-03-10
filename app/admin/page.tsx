// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase"; // Adjust if still in root lib/
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Alert from "../components/Alert";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./Admin.module.css";

type QuestionType = "dragAndDrop" | "fixTheCode" | "multipleChoice" | "subobjective" | "accomplishTheTask";
type Language = "java" | "python" | "cpp" | "csharp" | "javascript" | "react" | "nextjs" | "typescript" | "html" | "css";
type Difficulty = "easy" | "medium" | "hard";

interface QuestionData {
  snippets?: string[];
  correctOrder?: number[];
  code?: string;
  correctCode?: string;
  options?: string[];
  correctAnswer?: number;
  codeTemplate?: string;
  answers?: string[];
  starterCode?: string;
  testCases?: { input: any; output: any }[];
}

interface Question {
  type: QuestionType;
  language: Language;
  difficulty: Difficulty;
  questionText: string;
  data: QuestionData;
  createdAt: string;
}

// Drag and Drop Item Component
interface SnippetItemProps {
  snippet: string;
  index: number;
  moveSnippet: (fromIndex: number, toIndex: number) => void;
}

const SnippetItem = ({ snippet, index, moveSnippet }: SnippetItemProps) => {
  const [, drag] = useDrag({
    type: "SNIPPET",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "SNIPPET",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSnippet(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={styles.snippetItem}>
      {snippet}
    </div>
  );
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [questionType, setQuestionType] = useState<QuestionType | "">("");
  const [language, setLanguage] = useState<Language | "">("javascript");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("medium");
  const [questionText, setQuestionText] = useState("");
  const [data, setData] = useState<QuestionData>({});
  const [alertMessage, setAlertMessage] = useState("");
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("adminAuth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "nigerianfiah@gmail.com" && password === "250108Ken$") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
  };

  const applyTemplate = (type: QuestionType) => {
    setQuestionType(type);
    switch (type) {
      case "dragAndDrop":
        setQuestionText("Arrange these snippets to sort an array in ascending order.");
        setData({
          snippets: ["let arr = [3, 1, 2];", "arr.sort((a, b) => a - b);", "console.log(arr);"],
          correctOrder: [0, 1, 2],
        });
        break;
      case "fixTheCode":
        setQuestionText("This code should sum a list but counts items instead. Fix it.");
        setData({
          code: "let sum = 0;\nfor (let i of [1, 2, 3]) {\n  sum += 1;\n}",
          correctCode: "let sum = 0;\nfor (let i of [1, 2, 3]) {\n  sum += i;\n}",
        });
        break;
      case "multipleChoice":
        setQuestionText("What is the output of `console.log(1 + '2');`?");
        setData({
          options: ["3", "12", "NaN", "undefined"],
          correctAnswer: 1,
        });
        break;
      case "subobjective":
        setQuestionText("Fill in the blanks to reverse a string.");
        setData({
          codeTemplate: "function reverse(str) {\n  let result = '';\n  for (let i = str.length - 1; ___ >= 0; i--) {\n    result += str[___];\n  }\n  return result;\n}",
          answers: ["i", "i"],
        });
        break;
      case "accomplishTheTask":
        setQuestionText("Write a function to find the longest substring without repeating characters.");
        setData({
          starterCode: "function longestSubstring(s) {\n  // Your code here\n}",
          testCases: [
            { input: "abcabcbb", output: 3 },
            { input: "bbbbb", output: 1 },
            { input: "pwwkew", output: 3 },
          ],
        });
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionType || !language || !difficulty || !questionText) {
      setAlertMessage("Please fill in all required fields.");
      return;
    }

    const question: Question = {
      type: questionType,
      language,
      difficulty,
      questionText,
      data,
      createdAt: new Date().toISOString(),
    };

    setPreviewQuestion(question);
  };

  const handleConfirmUpload = async () => {
    if (!previewQuestion) return;

    try {
      await addDoc(collection(db, "questions"), previewQuestion);
      setAlertMessage("Question uploaded successfully!");
      resetForm();
      setPreviewQuestion(null);
    } catch (error) {
      setAlertMessage("Failed to upload question. Try again.");
    }
  };

  const handleEdit = () => {
    setPreviewQuestion(null);
  };

  const resetForm = () => {
    setQuestionType("");
    setLanguage("javascript");
    setDifficulty("medium");
    setQuestionText("");
    setData({});
  };

  const renderTypeSpecificFields = () => {
    switch (questionType) {
      case "dragAndDrop":
        return (
          <>
            <Textarea
              placeholder="Snippets (one per line)"
              value={data.snippets?.join("\n") || ""}
              onChange={(e) => setData({ ...data, snippets: e.target.value.split("\n") })}
              className={styles.textarea}
            />
            <Input
              placeholder="Correct order (comma-separated indices, e.g., 0,1,2)"
              value={data.correctOrder?.join(",") || ""}
              onChange={(e) => setData({ ...data, correctOrder: e.target.value.split(",").map(Number) })}
              className={styles.input}
            />
          </>
        );
      case "fixTheCode":
        return (
          <>
            <Textarea
              placeholder="Code with error"
              value={data.code || ""}
              onChange={(e) => setData({ ...data, code: e.target.value })}
              className={styles.textarea}
            />
            <Textarea
              placeholder="Correct code"
              value={data.correctCode || ""}
              onChange={(e) => setData({ ...data, correctCode: e.target.value })}
              className={styles.textarea}
            />
          </>
        );
      case "multipleChoice":
        return (
          <>
            <Textarea
              placeholder="Options (one per line)"
              value={data.options?.join("\n") || ""}
              onChange={(e) => setData({ ...data, options: e.target.value.split("\n") })}
              className={styles.textarea}
            />
            <Input
              type="number"
              placeholder="Correct answer index (0-based)"
              value={data.correctAnswer || ""}
              onChange={(e) => setData({ ...data, correctAnswer: Number(e.target.value) })}
              className={styles.input}
            />
          </>
        );
      case "subobjective":
        return (
          <>
            <Textarea
              placeholder="Code template with ___ for blanks"
              value={data.codeTemplate || ""}
              onChange={(e) => setData({ ...data, codeTemplate: e.target.value })}
              className={styles.textarea}
            />
            <Textarea
              placeholder="Answers (one per line)"
              value={data.answers?.join("\n") || ""}
              onChange={(e) => setData({ ...data, answers: e.target.value.split("\n") })}
              className={styles.textarea}
            />
          </>
        );
      case "accomplishTheTask":
        return (
          <>
            <Textarea
              placeholder="Starter code"
              value={data.starterCode || ""}
              onChange={(e) => setData({ ...data, starterCode: e.target.value })}
              className={styles.textarea}
            />
            <Textarea
              placeholder="Test cases (JSON format, e.g., [{'input': 'abc', 'output': 3}])"
              value={data.testCases ? JSON.stringify(data.testCases, null, 2) : ""}
              onChange={(e) => setData({ ...data, testCases: JSON.parse(e.target.value) })}
              className={styles.textarea}
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!previewQuestion) return null;

    const moveSnippet = (fromIndex: number, toIndex: number) => {
      if (!previewQuestion.data.snippets) return;
      const updatedSnippets = [...previewQuestion.data.snippets];
      const [movedSnippet] = updatedSnippets.splice(fromIndex, 1);
      updatedSnippets.splice(toIndex, 0, movedSnippet);
      setPreviewQuestion({
        ...previewQuestion,
        data: { ...previewQuestion.data, snippets: updatedSnippets },
      });
    };

    return (
      <div className={styles.previewContainer}>
        <h2 className={styles.previewTitle}>Question Preview</h2>
        <p><strong>Type:</strong> {previewQuestion.type}</p>
        <p><strong>Language:</strong> {previewQuestion.language.toUpperCase()}</p>
        <p><strong>Difficulty:</strong> {previewQuestion.difficulty}</p>
        <p><strong>Question:</strong> {previewQuestion.questionText}</p>
        
        {previewQuestion.type === "dragAndDrop" && (
          <DndProvider backend={HTML5Backend}>
            <div>
              <p><strong>Snippets (Drag to reorder):</strong></p>
              <div className={styles.snippetList}>
                {previewQuestion.data.snippets?.map((snippet, idx) => (
                  <SnippetItem
                    key={idx}
                    snippet={snippet}
                    index={idx}
                    moveSnippet={moveSnippet}
                  />
                ))}
              </div>
              <p><strong>Correct Order (Indices):</strong> {previewQuestion.data.correctOrder?.join(", ")}</p>
            </div>
          </DndProvider>
        )}
        {previewQuestion.type === "fixTheCode" && (
          <div>
            <p><strong>Code with Error:</strong></p>
            <pre className={styles.codeBlock}>{previewQuestion.data.code}</pre>
            <p><strong>Correct Code:</strong></p>
            <pre className={styles.codeBlock}>{previewQuestion.data.correctCode}</pre>
          </div>
        )}
        {previewQuestion.type === "multipleChoice" && (
          <div>
            <p><strong>Options:</strong></p>
            <ul className={styles.previewList}>
              {previewQuestion.data.options?.map((option, idx) => (
                <li key={idx}>{idx === previewQuestion.data.correctAnswer ? `${option} (Correct)` : option}</li>
              ))}
            </ul>
          </div>
        )}
        {previewQuestion.type === "subobjective" && (
          <div>
            <p><strong>Code Template:</strong></p>
            <pre className={styles.codeBlock}>{previewQuestion.data.codeTemplate}</pre>
            <p><strong>Answers:</strong></p>
            <ul className={styles.previewList}>
              {previewQuestion.data.answers?.map((answer, idx) => (
                <li key={idx}>{answer}</li>
              ))}
            </ul>
          </div>
        )}
        {previewQuestion.type === "accomplishTheTask" && (
          <div>
            <p><strong>Starter Code:</strong></p>
            <pre className={styles.codeBlock}>{previewQuestion.data.starterCode}</pre>
            <p><strong>Test Cases:</strong></p>
            <pre className={styles.codeBlock}>{JSON.stringify(previewQuestion.data.testCases, null, 2)}</pre>
          </div>
        )}

        <div className={styles.previewButtons}>
          <Button onClick={handleConfirmUpload} className={styles.button}>Confirm Upload</Button>
          <Button onClick={handleEdit} className={styles.editButton}>Edit</Button>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Login</h1>
        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {loginError && <p className={styles.error}>{loginError}</p>}
          <Button type="submit" className={styles.button}>Login</Button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}
      <div className={styles.header}>
        <h1 className={styles.title}>Admin - Upload Question</h1>
        <Button onClick={handleLogout} className={styles.logoutButton}>Logout</Button>
      </div>
      
      {previewQuestion ? (
        renderPreview()
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select onValueChange={(value: string) => applyTemplate(value as QuestionType)} value={questionType}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dragAndDrop">Drag and Drop</SelectItem>
              <SelectItem value="fixTheCode">Fix the Code</SelectItem>
              <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
              <SelectItem value="subobjective">Subobjective</SelectItem>
              <SelectItem value="accomplishTheTask">Accomplish the Task</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: string) => setLanguage(value as Language)} value={language}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {["java", "python", "cpp", "csharp", "javascript", "react", "nextjs", "typescript", "html", "css"].map((lang) => (
                <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value: string) => setDifficulty(value as Difficulty)} value={difficulty}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Question text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className={styles.textarea}
          />
          {renderTypeSpecificFields()}
          <Button type="submit" className={styles.button}>Preview Question</Button>
        </form>
      )}
    </div>
  );
}