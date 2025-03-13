import { createQuestion, createQuestionSet } from '../src/lib/firebase/questions';
import { Question, QuestionSet } from '../src/types/questions';

// Example questions for each format
const sampleQuestions: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Drag and Drop Example
  {
    title: "Order React Lifecycle Methods",
    description: "Arrange these React lifecycle methods in the order they are called during component mounting.",
    format: "DragAndDrop",
    language: "React",
    difficulty: "Medium",
    points: 100,
    timeLimit: 120,
    tags: ["react", "lifecycle", "components"],
    codeSnippets: [
      { id: "1", content: "constructor()", order: 1 },
      { id: "2", content: "static getDerivedStateFromProps()", order: 2 },
      { id: "3", content: "render()", order: 3 },
      { id: "4", content: "componentDidMount()", order: 4 }
    ],
    correctOrder: [1, 2, 3, 4]
  },

  // Fix The Code Example
  {
    title: "Fix the Promise Chain",
    description: "There's an error in this Promise chain. Find and fix it.",
    format: "FixTheCode",
    language: "JavaScript",
    difficulty: "Easy",
    points: 50,
    timeLimit: 180,
    tags: ["javascript", "promises", "async"],
    code: `fetch('https://api.example.com/data')
  .then(response => response.json)
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });`,
    errorLine: 2,
    correctCode: `fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });`,
    hint: "Check how the response is being parsed"
  },

  // Multiple Choice Example
  {
    title: "TypeScript Type Assertion",
    description: "Which syntax is correct for type assertion in TypeScript?",
    format: "MultipleChoice",
    language: "TypeScript",
    difficulty: "Easy",
    points: 30,
    timeLimit: 60,
    tags: ["typescript", "types", "basics"],
    question: "How do you assert that variable 'value' is of type 'string'?",
    options: [
      "value as string",
      "<string>value",
      "value instanceof string",
      "value.asType('string')"
    ],
    correctAnswer: 0,
    explanation: "In TypeScript, you can use either 'as' syntax (value as string) or angle bracket syntax (<string>value) for type assertion. The 'as' syntax is preferred when working with JSX."
  },

  // Subobjective Example
  {
    title: "Complete the Python Function",
    description: "Fill in the blanks to complete this Python function that calculates the factorial of a number.",
    format: "Subobjective",
    language: "Python",
    difficulty: "Medium",
    points: 80,
    timeLimit: 180,
    tags: ["python", "recursion", "math"],
    code: `def factorial(n):
    if n == ___:
        return ___
    return n * factorial(___)`,
    blanks: [
      { lineNumber: 2, correctAnswer: "0", hint: "Base case for factorial" },
      { lineNumber: 3, correctAnswer: "1", hint: "Factorial of 0 is 1" },
      { lineNumber: 4, correctAnswer: "n - 1", hint: "Recursive call should decrease n" }
    ]
  },

  // Accomplish Task Example
  {
    title: "Implement Quick Sort",
    description: "Implement the quicksort algorithm in C++.",
    format: "AccomplishTask",
    language: "C++",
    difficulty: "Hard",
    points: 200,
    timeLimit: 3600,
    tags: ["c++", "sorting", "algorithms", "divide-and-conquer"],
    prompt: "Implement the quicksort algorithm that sorts an array in ascending order. Your implementation should handle arrays of integers.",
    startingCode: `void quickSort(int arr[], int low, int high) {
    // Your implementation here
}`,
    testCases: [
      {
        input: "[4, 2, 8, 3, 1, 5, 7, 6]",
        expectedOutput: "[1, 2, 3, 4, 5, 6, 7, 8]",
        isHidden: false
      },
      {
        input: "[1, 1, 1, 1]",
        expectedOutput: "[1, 1, 1, 1]",
        isHidden: false
      },
      {
        input: "[-5, 10, 0, -3, 8]",
        expectedOutput: "[-5, -3, 0, 8, 10]",
        isHidden: true
      }
    ],
    constraints: {
      timeComplexity: "O(n log n) average case",
      spaceComplexity: "O(log n)",
      inputConstraints: [
        "1 ≤ array length ≤ 10^5",
        "-10^9 ≤ array elements ≤ 10^9"
      ]
    },
    solutionCode: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        
        int pi = i + 1;
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
  }
];

// Example question set
const sampleQuestionSet: Omit<QuestionSet, 'id'> = {
  title: "JavaScript Fundamentals",
  description: "Master the basics of JavaScript programming",
  difficulty: "Easy",
  language: "JavaScript",
  questionIds: [], // Will be populated after uploading questions
  requiredPoints: 100,
  order: 1
};

async function uploadSampleQuestions() {
  try {
    console.log('Starting to upload sample questions...');
    
    // Upload questions
    const questionIds = await Promise.all(
      sampleQuestions.map(async (question) => {
        const id = await createQuestion(question);
        console.log(`Uploaded question: ${question.title} (${id})`);
        return id;
      })
    );

    // Create question set with uploaded question IDs
    const questionSet = {
      ...sampleQuestionSet,
      questionIds
    };
    const setId = await createQuestionSet(questionSet);
    console.log(`Created question set: ${questionSet.title} (${setId})`);

    console.log('Successfully uploaded all sample questions and created question set!');
  } catch (error) {
    console.error('Error uploading sample questions:', error);
  }
}

// Run the upload script
uploadSampleQuestions(); 