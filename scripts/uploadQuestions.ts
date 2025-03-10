// scripts/uploadQuestions.ts
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const questions = [
    {
        "type": "dragAndDrop",
        "language": "javascript",
        "difficulty": "medium",
        "questionText": "Arrange these snippets to filter even numbers from an array.",
        "data": {
          "snippets": [
            "let arr = [1, 2, 3, 4, 5];",
            "let evens = arr.filter(num => num % 2 === 0);",
            "console.log(evens);"
          ],
          "correctOrder": [0, 1, 2]
        },
        "createdAt": "2025-03-09T17:00:00Z"
      },

      {
        "type": "fixTheCode",
        "language": "python",
        "difficulty": "easy",
        "questionText": "This code should sum a list but counts items instead. Fix it.",
        "data": {
          "code": "sum = 0\nfor i in [1, 2, 3]:\n  sum += 1",
          "correctCode": "sum = 0\nfor i in [1, 2, 3]:\n  sum += i"
        },
        "createdAt": "2025-03-09T17:00:00Z"
      },

      {
        "type": "multipleChoice",
        "language": "typescript",
        "difficulty": "medium",
        "questionText": "What’s the type of `x` in `let x: string | number = 42;`?",
        "data": {
          "options": ["string", "number", "string | number", "any"],
          "correctAnswer": 2
        },
        "createdAt": "2025-03-09T17:00:00Z"
      },

      {
        "type": "subobjective",
        "language": "cpp",
        "difficulty": "hard",
        "questionText": "Fill in the blanks to implement a binary search.",
        "data": {
          "codeTemplate": "int search(vector<int>& nums, int target) {\n  int l = 0, r = nums.size() - 1;\n  ___ (l <= r) {\n    int mid = l + (r - l) / 2;\n    ___ (nums[mid] == target) return mid;\n    ___ (nums[mid] < target) l = mid + 1;\n    else r = mid - 1;\n  }\n  return -1;\n}",
          "answers": ["while", "if", "else if"]
        },
        "createdAt": "2025-03-09T17:00:00Z"
      },

      {
        "type": "accomplishTheTask",
        "language": "java",
        "difficulty": "hard",
        "questionText": "Given a string, find the length of the longest substring without repeating characters.",
        "data": {
          "starterCode": "class Solution {\n  public int lengthOfLongestSubstring(String s) {\n    \n  }\n}",
          "testCases": [
            { "input": "abcabcbb", "output": 3 },
            { "input": "bbbbb", "output": 1 },
            { "input": "pwwkew", "output": 3 }
          ]
        },
        "createdAt": "2025-03-09T17:00:00Z"
      }
];

async function uploadQuestions() {
  for (const question of questions) {
    try {
      await addDoc(collection(db, "questions"), question);
      console.log(`Uploaded: ${question.questionText}`);
    } catch (error) {
      console.error("Error uploading:", error);
    }
  }
}

uploadQuestions();