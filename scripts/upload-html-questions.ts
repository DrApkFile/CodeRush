import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import type {
  Question,
  Language,
  QuestionFormat,
  Difficulty,
  MultipleChoiceQuestion,
  DragAndDropQuestion,
  FixTheCodeQuestion,
  SubobjectiveQuestion,
  AccomplishTaskQuestion
} from '@/src/types/questions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HTML_TOPICS = [
  'Elements & Tags',
  'Forms & Input',
  'Tables & Lists',
  'Semantic HTML',
  'Multimedia',
  'Accessibility',
  'SEO Basics',
  'HTML5 Features'
];

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

// Helper function to create a Firestore timestamp
const createTimestamp = () => {
  return Timestamp.fromDate(new Date());
};

// Multiple Choice Questions (10 questions)
const multipleChoiceQuestions: Omit<MultipleChoiceQuestion, 'createdAt' | 'updatedAt'>[] = [
  // Easy Questions
  {
    title: "Basic HTML Structure",
    description: "What is the correct order of HTML document structure?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,
    options: [
      "DOCTYPE, html, head, body",
      "html, head, body, DOCTYPE",
      "head, body, html, DOCTYPE",
      "body, head, html, DOCTYPE"
    ],
    correctAnswer: 0
  },
  {
    title: "HTML Headings",
    description: "Which heading tag represents the highest level heading?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<h1>Main Title</h1>
<h2>Subtitle</h2>
<h3>Section Title</h3>`,
    options: ["<h1>", "<h2>", "<h3>", "<h4>"],
    correctAnswer: 0
  },
  {
    title: "HTML Links",
    description: "What is the correct HTML for creating a hyperlink?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<a href="https://example.com">Click here</a>`,
    options: [
      "<link>Click here</link>",
      "<a href='https://example.com'>Click here</a>",
      "<hyperlink>Click here</hyperlink>",
      "<url>Click here</url>"
    ],
    correctAnswer: 1
  },
  {
    title: "HTML Images",
    description: "Which attribute is required for the <img> tag?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<img src="image.jpg" alt="Description">`,
    options: ["src", "alt", "width", "height"],
    correctAnswer: 0
  },
  {
    title: "HTML Lists",
    description: "What is the correct HTML for creating an unordered list?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>`,
    options: [
      "<list><item>Item 1</item></list>",
      "<ul><li>Item 1</li></ul>",
      "<ol><li>Item 1</li></ol>",
      "<dl><dt>Item 1</dt></dl>"
    ],
    correctAnswer: 1
  },
  // Medium Questions
  {
    title: "HTML5 Semantic Elements",
    description: "Which HTML5 element is used to define the main content of a document?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "Semantic HTML",
    points: 15,
    timeLimit: 300,
    code: `<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>`,
    options: ["<content>", "<main>", "<section>", "<article>"],
    correctAnswer: 1
  },
  {
    title: "HTML Forms",
    description: "Which input type is used for email validation?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "Forms & Input",
    points: 15,
    timeLimit: 300,
    code: `<input type="email" name="email">`,
    options: ["type='text'", "type='email'", "type='mail'", "type='input'"],
    correctAnswer: 1
  },
  {
    title: "HTML Tables",
    description: "Which HTML element is used to define a table row?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "Tables & Lists",
    points: 15,
    timeLimit: 300,
    code: `<table>
  <tr>
    <td>Data</td>
  </tr>
</table>`,
    options: ["<row>", "<tr>", "<td>", "<th>"],
    correctAnswer: 1
  },
  {
    title: "HTML5 Video",
    description: "Which HTML5 element is used to play video files?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "Multimedia",
    points: 15,
    timeLimit: 300,
    code: `<video controls>
  <source src="movie.mp4" type="video/mp4">
</video>`,
    options: ["<movie>", "<video>", "<media>", "<play>"],
    correctAnswer: 1
  },
  {
    title: "HTML Meta Tags",
    description: "Which meta tag is used for character encoding?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "SEO Basics",
    points: 15,
    timeLimit: 300,
    code: `<meta charset="UTF-8">`,
    options: ["<meta charset>", "<meta encoding>", "<meta type>", "<meta format>"],
    correctAnswer: 0
  },
  // Hard Questions
  {
    title: "HTML5 Canvas",
    description: "What is the purpose of the HTML5 canvas element?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `<canvas id="myCanvas" width="200" height="100"></canvas>`,
    options: [
      "To display images",
      "To create interactive graphics",
      "To play videos",
      "To create forms"
    ],
    correctAnswer: 1
  },
  {
    title: "HTML5 Web Storage",
    description: "Which storage object has no expiration time?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `localStorage.setItem("name", "John");`,
    options: ["sessionStorage", "localStorage", "cookies", "cacheStorage"],
    correctAnswer: 1
  },
  {
    title: "HTML5 Web Workers",
    description: "What is the main purpose of Web Workers?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const worker = new Worker("worker.js");`,
    options: [
      "To create animations",
      "To run scripts in background",
      "To handle forms",
      "To create layouts"
    ],
    correctAnswer: 1
  },
  {
    title: "HTML5 Drag and Drop",
    description: "Which event is fired when dragging starts?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `element.addEventListener('dragstart', handleDragStart);`,
    options: ["dragbegin", "dragstart", "startdrag", "begindrag"],
    correctAnswer: 1
  },
  {
    title: "HTML5 WebSocket",
    description: "What is the purpose of WebSocket in HTML5?",
    language: "HTML",
    format: "MultipleChoice",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const ws = new WebSocket("ws://server.com");`,
    options: [
      "To create animations",
      "To enable real-time communication",
      "To handle forms",
      "To create layouts"
    ],
    correctAnswer: 1
  }
];

// Drag and Drop Questions (10 questions)
const dragAndDropQuestions: Omit<DragAndDropQuestion, 'createdAt' | 'updatedAt'>[] = [
  // Easy Questions
  {
    title: "HTML Form Structure",
    description: "Arrange the HTML form elements in the correct order for a proper form structure.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "Forms & Input",
    points: 10,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<form>",
      "<label>",
      "<input>",
      "</label>",
      "</form>"
    ],
    correctOrder: [0, 1, 2, 3, 4]
  },
  {
    title: "Basic HTML Structure",
    description: "Arrange the basic HTML document structure in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<!DOCTYPE html>",
      "<html>",
      "<head>",
      "<title>",
      "</title>",
      "</head>",
      "<body>",
      "</body>",
      "</html>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    title: "HTML List Structure",
    description: "Arrange the HTML list elements in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<ul>",
      "<li>",
      "Item 1",
      "</li>",
      "</ul>"
    ],
    correctOrder: [0, 1, 2, 3, 4]
  },
  {
    title: "HTML Table Structure",
    description: "Arrange the HTML table elements in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<table>",
      "<tr>",
      "<td>",
      "Data",
      "</td>",
      "</tr>",
      "</table>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    title: "HTML Link Structure",
    description: "Arrange the HTML link elements in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<a",
      "href='#'",
      ">",
      "Link Text",
      "</a>"
    ],
    correctOrder: [0, 1, 2, 3, 4]
  },
  // Medium Questions
  {
    title: "HTML5 Semantic Structure",
    description: "Arrange the semantic HTML5 elements in the correct order for a typical webpage layout.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Medium",
    topic: "Semantic HTML",
    points: 15,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<header>",
      "<nav>",
      "</nav>",
      "</header>",
      "<main>",
      "<article>",
      "</article>",
      "</main>",
      "<footer>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    title: "HTML Form with Validation",
    description: "Arrange the HTML form elements with proper validation attributes.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Medium",
    topic: "Forms & Input",
    points: 15,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<form",
      "action='#'",
      "method='post'",
      ">",
      "<input",
      "type='email'",
      "required",
      ">",
      "</form>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    title: "HTML5 Video Structure",
    description: "Arrange the HTML5 video elements with proper source and controls.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Medium",
    topic: "Multimedia",
    points: 15,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<video",
      "controls",
      ">",
      "<source",
      "src='video.mp4'",
      "type='video/mp4'",
      ">",
      "</video>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  {
    title: "HTML5 Canvas Setup",
    description: "Arrange the HTML5 canvas elements with proper attributes.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Medium",
    topic: "HTML5 Features",
    points: 15,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<canvas",
      "id='myCanvas'",
      "width='200'",
      "height='100'",
      ">",
      "</canvas>"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5]
  },
  {
    title: "HTML Meta Tags",
    description: "Arrange the HTML meta tags in the correct order for proper SEO.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Medium",
    topic: "SEO Basics",
    points: 15,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "<meta",
      "charset='UTF-8'",
      ">",
      "<meta",
      "name='description'",
      "content='Page description'",
      ">"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6]
  },
  // Hard Questions
  {
    title: "HTML5 Web Worker Setup",
    description: "Arrange the HTML5 Web Worker implementation in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "const worker =",
      "new Worker('worker.js');",
      "worker.onmessage =",
      "function(e) {",
      "console.log(e.data);",
      "};",
      "worker.postMessage('start');"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    title: "HTML5 WebSocket Setup",
    description: "Arrange the HTML5 WebSocket implementation in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "const ws =",
      "new WebSocket('ws://server.com');",
      "ws.onopen =",
      "function() {",
      "ws.send('Hello');",
      "};",
      "ws.onmessage =",
      "function(e) {",
      "console.log(e.data);",
      "};"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  {
    title: "HTML5 Drag and Drop Setup",
    description: "Arrange the HTML5 Drag and Drop implementation in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "element.draggable = true;",
      "element.addEventListener('dragstart',",
      "function(e) {",
      "e.dataTransfer.setData('text',",
      "e.target.id);",
      "});",
      "target.addEventListener('drop',",
      "function(e) {",
      "e.preventDefault();",
      "const data = e.dataTransfer.getData('text');",
      "});"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    title: "HTML5 Local Storage Setup",
    description: "Arrange the HTML5 Local Storage implementation in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "localStorage.setItem('key',",
      "'value');",
      "const value =",
      "localStorage.getItem('key');",
      "localStorage.removeItem('key');",
      "localStorage.clear();"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5]
  },
  {
    title: "HTML5 Canvas Drawing Setup",
    description: "Arrange the HTML5 Canvas drawing implementation in the correct order.",
    language: "HTML",
    format: "DragAndDrop",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: "",
    codeSnippets: [
      "const canvas =",
      "document.getElementById('myCanvas');",
      "const ctx =",
      "canvas.getContext('2d');",
      "ctx.beginPath();",
      "ctx.arc(100, 75, 50, 0, 2 * Math.PI);",
      "ctx.stroke();"
    ],
    correctOrder: [0, 1, 2, 3, 4, 5, 6]
  }
];

// Fix the Code Questions (10 questions)
const fixTheCodeQuestions: Omit<FixTheCodeQuestion, 'createdAt' | 'updatedAt'>[] = [
  // Easy Questions
  {
    title: "Fix HTML Accessibility",
    description: "Fix the accessibility issues in the following HTML code.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Easy",
    topic: "Accessibility",
    points: 10,
    timeLimit: 300,
    code: `<img src="logo.png">
<button>Click me</button>
<div role="button">Submit</div>`,
    solution: `<img src="logo.png" alt="Company Logo">
<button aria-label="Submit form">Click me</button>
<button>Submit</button>`,
    errorLine: 1,
    correctCode: `<img src="logo.png" alt="Company Logo">
<button aria-label="Submit form">Click me</button>
<button>Submit</button>`
  },
  {
    title: "Fix HTML Form Structure",
    description: "Fix the HTML form structure issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Easy",
    topic: "Forms & Input",
    points: 10,
    timeLimit: 300,
    code: `<form>
  <input type="text">
  <button>Submit</button>
</form>`,
    solution: `<form action="#" method="post">
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" required>
  <button type="submit">Submit</button>
</form>`,
    errorLine: 1,
    correctCode: `<form action="#" method="post">
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" required>
  <button type="submit">Submit</button>
</form>`
  },
  {
    title: "Fix HTML Table Structure",
    description: "Fix the HTML table structure issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: `<table>
  <td>Header 1</td>
  <td>Header 2</td>
  <tr>Data 1</tr>
  <tr>Data 2</tr>
</table>`,
    solution: `<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>`,
    errorLine: 1,
    correctCode: `<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>`
  },
  {
    title: "Fix HTML List Structure",
    description: "Fix the HTML list structure issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: `<ul>
  <li>Item 1
  <li>Item 2
  <li>Item 3
</ul>`,
    solution: `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`,
    errorLine: 1,
    correctCode: `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`
  },
  {
    title: "Fix HTML Link Structure",
    description: "Fix the HTML link structure issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<a href="page.html">Click here</a>`,
    solution: `<a href="page.html" target="_blank" rel="noopener noreferrer">Click here</a>`,
    errorLine: 1,
    correctCode: `<a href="page.html" target="_blank" rel="noopener noreferrer">Click here</a>`
  },
  // Medium Questions
  {
    title: "Fix HTML5 Semantic Structure",
    description: "Fix the HTML5 semantic structure issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Medium",
    topic: "Semantic HTML",
    points: 15,
    timeLimit: 300,
    code: `<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">...</div>
</div>
<div class="footer">...</div>`,
    solution: `<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>`,
    errorLine: 1,
    correctCode: `<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>`
  },
  {
    title: "Fix HTML5 Form Validation",
    description: "Fix the HTML5 form validation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Medium",
    topic: "Forms & Input",
    points: 15,
    timeLimit: 300,
    code: `<form>
  <input type="text" required>
  <input type="email">
  <input type="number">
  <button>Submit</button>
</form>`,
    solution: `<form novalidate>
  <input type="text" required pattern="[A-Za-z]+" title="Only letters allowed">
  <input type="email" required>
  <input type="number" min="0" max="100" step="1">
  <button type="submit">Submit</button>
</form>`,
    errorLine: 1,
    correctCode: `<form novalidate>
  <input type="text" required pattern="[A-Za-z]+" title="Only letters allowed">
  <input type="email" required>
  <input type="number" min="0" max="100" step="1">
  <button type="submit">Submit</button>
</form>`
  },
  {
    title: "Fix HTML5 Video Implementation",
    description: "Fix the HTML5 video implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Medium",
    topic: "Multimedia",
    points: 15,
    timeLimit: 300,
    code: `<video>
  <source src="video.mp4">
</video>`,
    solution: `<video controls>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  Your browser does not support the video tag.
</video>`,
    errorLine: 1,
    correctCode: `<video controls>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  Your browser does not support the video tag.
</video>`
  },
  {
    title: "Fix HTML5 Canvas Setup",
    description: "Fix the HTML5 canvas setup issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Medium",
    topic: "HTML5 Features",
    points: 15,
    timeLimit: 300,
    code: `<canvas>
  <script>
    const ctx = canvas.getContext('2d');
    ctx.fillRect(10, 10, 100, 100);
  </script>
</canvas>`,
    solution: `<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillRect(10, 10, 100, 100);
</script>`,
    errorLine: 1,
    correctCode: `<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillRect(10, 10, 100, 100);
</script>`
  },
  {
    title: "Fix HTML Meta Tags",
    description: "Fix the HTML meta tags for proper SEO.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Medium",
    topic: "SEO Basics",
    points: 15,
    timeLimit: 300,
    code: `<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>`,
    solution: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description">
  <meta name="keywords" content="HTML, CSS, JavaScript">
  <title>My Page</title>
</head>`,
    errorLine: 1,
    correctCode: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description">
  <meta name="keywords" content="HTML, CSS, JavaScript">
  <title>My Page</title>
</head>`
  },
  // Hard Questions
  {
    title: "Fix HTML5 Web Worker Implementation",
    description: "Fix the HTML5 Web Worker implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const worker = new Worker();
worker.postMessage('start');`,
    solution: `const worker = new Worker('worker.js');
worker.onmessage = function(e) {
  console.log(e.data);
};
worker.onerror = function(e) {
  console.error('Worker error:', e.message);
};
worker.postMessage('start');`,
    errorLine: 1,
    correctCode: `const worker = new Worker('worker.js');
worker.onmessage = function(e) {
  console.log(e.data);
};
worker.onerror = function(e) {
  console.error('Worker error:', e.message);
};
worker.postMessage('start');`
  },
  {
    title: "Fix HTML5 WebSocket Implementation",
    description: "Fix the HTML5 WebSocket implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const ws = new WebSocket();
ws.send('Hello');`,
    solution: `const ws = new WebSocket('ws://server.com');
ws.onopen = function() {
  ws.send('Hello');
};
ws.onmessage = function(e) {
  console.log(e.data);
};
ws.onerror = function(e) {
  console.error('WebSocket error:', e.message);
};
ws.onclose = function() {
  console.log('Connection closed');
};`,
    errorLine: 1,
    correctCode: `const ws = new WebSocket('ws://server.com');
ws.onopen = function() {
  ws.send('Hello');
};
ws.onmessage = function(e) {
  console.log(e.data);
};
ws.onerror = function(e) {
  console.error('WebSocket error:', e.message);
};
ws.onclose = function() {
  console.log('Connection closed');
};`
  },
  {
    title: "Fix HTML5 Drag and Drop Implementation",
    description: "Fix the HTML5 Drag and Drop implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `element.draggable = true;
element.addEventListener('dragstart', function(e) {
  e.dataTransfer.setData('text', e.target.id);
});
target.addEventListener('dragover', function(e) {
  e.preventDefault();
});
target.addEventListener('drop', function(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text');
  e.target.appendChild(document.getElementById(data));
});`,
    solution: `element.draggable = true;
element.addEventListener('dragstart', function(e) {
  e.dataTransfer.setData('text', e.target.id);
});
target.addEventListener('dragover', function(e) {
  e.preventDefault();
});
target.addEventListener('drop', function(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text');
  e.target.appendChild(document.getElementById(data));
});`,
    errorLine: 1,
    correctCode: `element.draggable = true;
element.addEventListener('dragstart', function(e) {
  e.dataTransfer.setData('text', e.target.id);
});
target.addEventListener('dragover', function(e) {
  e.preventDefault();
});
target.addEventListener('drop', function(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text');
  e.target.appendChild(document.getElementById(data));
});`
  },
  {
    title: "Fix HTML5 Local Storage Implementation",
    description: "Fix the HTML5 Local Storage implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');`,
    solution: `try {
  localStorage.setItem('key', 'value');
  const value = localStorage.getItem('key');
  if (!value) {
    throw new Error('Value not found');
  }
} catch (e) {
  console.error('Local Storage error:', e.message);
  // Fallback to session storage
  sessionStorage.setItem('key', 'value');
  const value = sessionStorage.getItem('key');
}`,
    errorLine: 1,
    correctCode: `try {
  localStorage.setItem('key', 'value');
  const value = localStorage.getItem('key');
  if (!value) {
    throw new Error('Value not found');
  }
} catch (e) {
  console.error('Local Storage error:', e.message);
  // Fallback to session storage
  sessionStorage.setItem('key', 'value');
  const value = sessionStorage.getItem('key');
}`
  },
  {
    title: "Fix HTML5 Canvas Drawing Implementation",
    description: "Fix the HTML5 Canvas drawing implementation issues.",
    language: "HTML",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
ctx.fillRect(10, 10, 100, 100);`,
    solution: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2d context');
}
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(100, 75, 50, 0, 2 * Math.PI);
ctx.fill();
ctx.strokeStyle = 'black';
ctx.stroke();`,
    errorLine: 1,
    correctCode: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2d context');
}
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(100, 75, 50, 0, 2 * Math.PI);
ctx.fill();
ctx.strokeStyle = 'black';
ctx.stroke();`
  }
];

// Subobjective Questions (10 questions)
const subobjectiveQuestions: Omit<SubobjectiveQuestion, 'createdAt' | 'updatedAt'>[] = [
  // Easy Questions
  {
    title: "Complete HTML Form Structure",
    description: "Fill in the blanks to complete the HTML form structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Easy",
    topic: "Forms & Input",
    points: 10,
    timeLimit: 300,
    code: `<form ___="submit.php" ___="post">
  <label ___="username">Username:</label>
  <input type="text" ___="username" ___="username" ___>
  <button type="___">Submit</button>
</form>`,
    blanks: ["action", "method", "for", "id", "name", "required", "submit"],
    answers: ["action", "method", "for", "id", "name", "required", "submit"]
  },
  {
    title: "Complete HTML Table Structure",
    description: "Fill in the blanks to complete the HTML table structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: `<table>
  <___>
    <___>Header 1</___>
    <___>Header 2</___>
  </___>
  <___>
    <___>Data 1</___>
    <___>Data 2</___>
  </___>
</table>`,
    blanks: ["thead", "th", "th", "thead", "tbody", "td", "td", "tbody"],
    answers: ["thead", "th", "th", "thead", "tbody", "td", "td", "tbody"]
  },
  {
    title: "Complete HTML List Structure",
    description: "Fill in the blanks to complete the HTML list structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    code: `<___>
  <___>Item 1</___>
  <___>Item 2</___>
  <___>Item 3</___>
</___>`,
    blanks: ["ul", "li", "li", "li", "ul"],
    answers: ["ul", "li", "li", "li", "ul"]
  },
  {
    title: "Complete HTML Link Structure",
    description: "Fill in the blanks to complete the HTML link structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<___ ___="page.html" ___="_blank" ___="noopener noreferrer">
  Click here
</___>`,
    blanks: ["a", "href", "target", "rel", "a"],
    answers: ["a", "href", "target", "rel", "a"]
  },
  {
    title: "Complete HTML Image Structure",
    description: "Fill in the blanks to complete the HTML image structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    code: `<___ ___="image.jpg" ___="Image description" ___="300" ___="200">`,
    blanks: ["img", "src", "alt", "width", "height"],
    answers: ["img", "src", "alt", "width", "height"]
  },
  // Medium Questions
  {
    title: "Complete HTML5 Semantic Structure",
    description: "Fill in the blanks to complete the HTML5 semantic structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "Semantic HTML",
    points: 15,
    timeLimit: 300,
    code: `<___>
  <___>Navigation</___>
</___>
<___>
  <___>Article content</___>
</___>
<___>Footer content</___>`,
    blanks: ["header", "nav", "nav", "header", "main", "article", "article", "main", "footer", "footer"],
    answers: ["header", "nav", "nav", "header", "main", "article", "article", "main", "footer", "footer"]
  },
  {
    title: "Complete HTML5 Form Validation",
    description: "Fill in the blanks to complete the HTML5 form validation.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "Forms & Input",
    points: 15,
    timeLimit: 300,
    code: `<form ___>
  <input type="text" ___ pattern="[A-Za-z]+" ___="Only letters allowed">
  <input type="email" ___>
  <input type="number" ___="0" ___="100" ___="1">
  <button type="___">Submit</button>
</form>`,
    blanks: ["novalidate", "required", "title", "required", "min", "max", "step", "submit"],
    answers: ["novalidate", "required", "title", "required", "min", "max", "step", "submit"]
  },
  {
    title: "Complete HTML5 Video Structure",
    description: "Fill in the blanks to complete the HTML5 video structure.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "Multimedia",
    points: 15,
    timeLimit: 300,
    code: `<___ ___>
  <___ ___="video.mp4" ___="video/mp4">
  <___ ___="video.webm" ___="video/webm">
  Your browser does not support the video tag.
</___>`,
    blanks: ["video", "controls", "source", "src", "type", "source", "src", "type", "video"],
    answers: ["video", "controls", "source", "src", "type", "source", "src", "type", "video"]
  },
  {
    title: "Complete HTML5 Canvas Setup",
    description: "Fill in the blanks to complete the HTML5 canvas setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "HTML5 Features",
    points: 15,
    timeLimit: 300,
    code: `<___ ___="myCanvas" ___="200" ___="100"></___>
<script>
  const canvas = document.___('myCanvas');
  const ctx = canvas.___('2d');
  ctx.___(10, 10, 100, 100);
</script>`,
    blanks: ["canvas", "id", "width", "height", "canvas", "getElementById", "getContext", "fillRect"],
    answers: ["canvas", "id", "width", "height", "canvas", "getElementById", "getContext", "fillRect"]
  },
  {
    title: "Complete HTML Meta Tags",
    description: "Fill in the blanks to complete the HTML meta tags.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "SEO Basics",
    points: 15,
    timeLimit: 300,
    code: `<head>
  <meta ___="UTF-8">
  <meta ___="viewport" ___="width=device-width, initial-scale=1.0">
  <meta ___="description" ___="Page description">
  <meta ___="keywords" ___="HTML, CSS, JavaScript">
  <title>My Page</title>
</head>`,
    blanks: ["charset", "name", "content", "name", "content", "name", "content"],
    answers: ["charset", "name", "content", "name", "content", "name", "content"]
  },
  // Hard Questions
  {
    title: "Complete HTML5 Web Worker Setup",
    description: "Fill in the blanks to complete the HTML5 Web Worker setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const worker = new ___('worker.js');
worker.___ = function(e) {
  console.log(e.data);
};
worker.___ = function(e) {
  console.error('Worker error:', e.message);
};
worker.___('start');`,
    blanks: ["Worker", "onmessage", "onerror", "postMessage"],
    answers: ["Worker", "onmessage", "onerror", "postMessage"]
  },
  {
    title: "Complete HTML5 WebSocket Setup",
    description: "Fill in the blanks to complete the HTML5 WebSocket setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const ws = new ___('ws://server.com');
ws.___ = function() {
  ws.___('Hello');
};
ws.___ = function(e) {
  console.log(e.data);
};
ws.___ = function(e) {
  console.error('WebSocket error:', e.message);
};
ws.___ = function() {
  console.log('Connection closed');
};`,
    blanks: ["WebSocket", "onopen", "send", "onmessage", "onerror", "onclose"],
    answers: ["WebSocket", "onopen", "send", "onmessage", "onerror", "onclose"]
  },
  {
    title: "Complete HTML5 Drag and Drop Setup",
    description: "Fill in the blanks to complete the HTML5 Drag and Drop setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `element.___ = true;
element.___('dragstart', function(e) {
  e.___.setData('text', e.target.id);
});
target.___('dragover', function(e) {
  e.___();
});
target.___('drop', function(e) {
  e.___();
  const data = e.___.getData('text');
  e.target.___(document.___(data));
});`,
    blanks: ["draggable", "addEventListener", "dataTransfer", "addEventListener", "preventDefault", "addEventListener", "preventDefault", "dataTransfer", "appendChild", "getElementById"],
    answers: ["draggable", "addEventListener", "dataTransfer", "addEventListener", "preventDefault", "addEventListener", "preventDefault", "dataTransfer", "appendChild", "getElementById"]
  },
  {
    title: "Complete HTML5 Local Storage Setup",
    description: "Fill in the blanks to complete the HTML5 Local Storage setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `try {
  localStorage.___('key', 'value');
  const value = localStorage.___('key');
  if (!value) {
    throw new ___('Value not found');
  }
} catch (e) {
  console.error('Local Storage error:', e.message);
  sessionStorage.___('key', 'value');
  const value = sessionStorage.___('key');
}`,
    blanks: ["setItem", "getItem", "Error", "setItem", "getItem"],
    answers: ["setItem", "getItem", "Error", "setItem", "getItem"]
  },
  {
    title: "Complete HTML5 Canvas Drawing Setup",
    description: "Fill in the blanks to complete the HTML5 Canvas drawing setup.",
    language: "HTML",
    format: "Subobjective",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 300,
    code: `const canvas = document.___('myCanvas');
const ctx = canvas.___('2d');
if (!ctx) {
  throw new ___('Could not get 2d context');
}
ctx.___ = 'red';
ctx.___();
ctx.___(100, 75, 50, 0, 2 * Math.PI);
ctx.___();
ctx.___ = 'black';
ctx.___();`,
    blanks: ["getElementById", "getContext", "Error", "fillStyle", "beginPath", "arc", "fill", "strokeStyle", "stroke"],
    answers: ["getElementById", "getContext", "Error", "fillStyle", "beginPath", "arc", "fill", "strokeStyle", "stroke"]
  }
];

// Accomplish Task Questions (10 questions)
const accomplishTaskQuestions: Omit<AccomplishTaskQuestion, 'createdAt' | 'updatedAt'>[] = [
  // Easy Questions
  {
    title: "Create a Basic HTML Form",
    description: "Create a basic HTML form with username and password fields.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Easy",
    topic: "Forms & Input",
    points: 10,
    timeLimit: 300,
    initialCode: `<form>
  <!-- Add your code here -->
</form>`,
    code: `<form>
  <!-- Add your code here -->
</form>`,
    solution: `<form action="#" method="post">
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>
  </div>
  <div>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required>
  </div>
  <button type="submit">Submit</button>
</form>`,
    testCases: [
      { input: "Check if form has username field", output: "true" },
      { input: "Check if form has password field", output: "true" },
      { input: "Check if form has submit button", output: "true" }
    ]
  },
  {
    title: "Create a Basic HTML Table",
    description: "Create a basic HTML table with headers and data cells.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    initialCode: `<table>
  <!-- Add your code here -->
</table>`,
    code: `<table>
  <!-- Add your code here -->
</table>`,
    solution: `<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
      <td>25</td>
      <td>New York</td>
    </tr>
  </tbody>
</table>`,
    testCases: [
      { input: "Check if table has thead", output: "true" },
      { input: "Check if table has tbody", output: "true" },
      { input: "Check if table has 3 columns", output: "true" }
    ]
  },
  {
    title: "Create a Basic HTML List",
    description: "Create a basic HTML unordered list with three items.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Easy",
    topic: "Tables & Lists",
    points: 10,
    timeLimit: 300,
    initialCode: `<ul>
  <!-- Add your code here -->
</ul>`,
    code: `<ul>
  <!-- Add your code here -->
</ul>`,
    solution: `<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>`,
    testCases: [
      { input: "Check if list has 3 items", output: "true" },
      { input: "Check if list is unordered", output: "true" }
    ]
  },
  {
    title: "Create a Basic HTML Link",
    description: "Create a basic HTML link with proper attributes.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    initialCode: `<a>
  <!-- Add your code here -->
</a>`,
    code: `<a>
  <!-- Add your code here -->
</a>`,
    solution: `<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Click here
</a>`,
    testCases: [
      { input: "Check if link has href attribute", output: "true" },
      { input: "Check if link has target attribute", output: "true" },
      { input: "Check if link has rel attribute", output: "true" }
    ]
  },
  {
    title: "Create a Basic HTML Image",
    description: "Create a basic HTML image with proper attributes.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Easy",
    topic: "Elements & Tags",
    points: 10,
    timeLimit: 300,
    initialCode: `<img>
  <!-- Add your code here -->
</img>`,
    code: `<img>
  <!-- Add your code here -->
</img>`,
    solution: `<img src="image.jpg" alt="Description" width="300" height="200">`,
    testCases: [
      { input: "Check if image has src attribute", output: "true" },
      { input: "Check if image has alt attribute", output: "true" },
      { input: "Check if image has width and height", output: "true" }
    ]
  },
  // Medium Questions
  {
    title: "Create a Semantic HTML Layout",
    description: "Create a semantic HTML layout with header, navigation, main content, and footer.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Medium",
    topic: "Semantic HTML",
    points: 15,
    timeLimit: 300,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<header>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Main Content</h1>
    <p>Article content goes here...</p>
  </article>
</main>
<footer>
  <p>&copy; 2024 Your Website</p>
</footer>`,
    testCases: [
      { input: "Check if header exists", output: "true" },
      { input: "Check if nav exists", output: "true" },
      { input: "Check if main exists", output: "true" },
      { input: "Check if footer exists", output: "true" }
    ]
  },
  {
    title: "Create an HTML Form with Validation",
    description: "Create an HTML form with proper validation attributes and error messages.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Medium",
    topic: "Forms & Input",
    points: 15,
    timeLimit: 300,
    initialCode: `<form>
  <!-- Add your code here -->
</form>`,
    code: `<form>
  <!-- Add your code here -->
</form>`,
    solution: `<form novalidate>
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required
           pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
           title="Please enter a valid email address">
    <span class="error-message"></span>
  </div>
  <div>
    <label for="age">Age:</label>
    <input type="number" id="age" name="age" required
           min="18" max="100" step="1"
           title="Please enter an age between 18 and 100">
    <span class="error-message"></span>
  </div>
  <button type="submit">Submit</button>
</form>`,
    testCases: [
      { input: "Check if email field has pattern", output: "true" },
      { input: "Check if age field has min and max", output: "true" },
      { input: "Check if form has error messages", output: "true" }
    ]
  },
  {
    title: "Create an HTML5 Video Player",
    description: "Create an HTML5 video player with multiple sources and fallback content.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Medium",
    topic: "Multimedia",
    points: 15,
    timeLimit: 300,
    initialCode: `<video>
  <!-- Add your code here -->
</video>`,
    code: `<video>
  <!-- Add your code here -->
</video>`,
    solution: `<video controls>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  <source src="video.ogg" type="video/ogg">
  Your browser does not support the video tag.
  <a href="video.mp4">Download the video</a>
</video>`,
    testCases: [
      { input: "Check if video has controls", output: "true" },
      { input: "Check if video has multiple sources", output: "true" },
      { input: "Check if video has fallback content", output: "true" }
    ]
  },
  {
    title: "Create an HTML5 Canvas Drawing",
    description: "Create an HTML5 canvas with a simple drawing.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Medium",
    topic: "HTML5 Features",
    points: 15,
    timeLimit: 300,
    initialCode: `<canvas>
  <!-- Add your code here -->
</canvas>`,
    code: `<canvas>
  <!-- Add your code here -->
</canvas>`,
    solution: `<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 100, 100);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(10, 10, 100, 100);
</script>`,
    testCases: [
      { input: "Check if canvas exists", output: "true" },
      { input: "Check if drawing code exists", output: "true" }
    ]
  },
  {
    title: "Create SEO-Friendly Meta Tags",
    description: "Create a set of SEO-friendly meta tags for a webpage.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Medium",
    topic: "SEO Basics",
    points: 15,
    timeLimit: 300,
    initialCode: `<head>
  <!-- Add your code here -->
</head>`,
    code: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A comprehensive guide to HTML5">
  <meta name="keywords" content="HTML5, web development, coding">
  <meta name="author" content="Your Name">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/page">
  <title>HTML5 Guide</title>
</head>`,
    solution: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A comprehensive guide to HTML5">
  <meta name="keywords" content="HTML5, web development, coding">
  <meta name="author" content="Your Name">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/page">
  <title>HTML5 Guide</title>
</head>`,
    testCases: [
      { input: "Check if charset meta tag exists", output: "true" },
      { input: "Check if viewport meta tag exists", output: "true" },
      { input: "Check if description meta tag exists", output: "true" }
    ]
  },
  // Hard Questions
  {
    title: "Create a Web Worker Implementation",
    description: "Create a complete Web Worker implementation with main thread and worker thread.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 600,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<!-- Main thread -->
<script>
  const worker = new Worker('worker.js');
  worker.onmessage = function(e) {
    console.log('Result:', e.data);
  };
  worker.onerror = function(e) {
    console.error('Worker error:', e.message);
  };
  worker.postMessage({ numbers: [1, 2, 3, 4, 5] });
</script>

<!-- worker.js -->
self.onmessage = function(e) {
  const numbers = e.data.numbers;
  const sum = numbers.reduce((a, b) => a + b, 0);
  self.postMessage(sum);
};`,
    testCases: [
      { input: "Check if worker is created", output: "true" },
      { input: "Check if message handlers exist", output: "true" },
      { input: "Check if worker file is referenced", output: "true" }
    ]
  },
  {
    title: "Create a WebSocket Implementation",
    description: "Create a complete WebSocket implementation with connection handling and messaging.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 600,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<script>
  const ws = new WebSocket('ws://server.com');
  
  ws.onopen = function() {
    console.log('Connected to server');
    ws.send('Hello Server!');
  };
  
  ws.onmessage = function(e) {
    console.log('Received:', e.data);
  };
  
  ws.onerror = function(e) {
    console.error('WebSocket error:', e.message);
  };
  
  ws.onclose = function() {
    console.log('Connection closed');
  };
  
  function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }
</script>`,
    testCases: [
      { input: "Check if WebSocket is created", output: "true" },
      { input: "Check if all event handlers exist", output: "true" },
      { input: "Check if send function exists", output: "true" }
    ]
  },
  {
    title: "Create a Drag and Drop Implementation",
    description: "Create a complete drag and drop implementation with multiple draggable items.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 600,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<div class="container">
  <div class="draggable" draggable="true" id="item1">Item 1</div>
  <div class="draggable" draggable="true" id="item2">Item 2</div>
  <div class="draggable" draggable="true" id="item3">Item 3</div>
  <div class="dropzone" id="zone1">Drop Zone 1</div>
  <div class="dropzone" id="zone2">Drop Zone 2</div>
</div>

<script>
  const draggables = document.querySelectorAll('.draggable');
  const dropzones = document.querySelectorAll('.dropzone');
  
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text', e.target.id);
      e.target.classList.add('dragging');
    });
    
    draggable.addEventListener('dragend', function(e) {
      e.target.classList.remove('dragging');
    });
  });
  
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', function(e) {
      this.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      const data = e.dataTransfer.getData('text');
      const draggable = document.getElementById(data);
      this.appendChild(draggable);
    });
  });
</script>`,
    testCases: [
      { input: "Check if draggable elements exist", output: "true" },
      { input: "Check if drop zones exist", output: "true" },
      { input: "Check if event listeners are attached", output: "true" }
    ]
  },
  {
    title: "Create a Local Storage Implementation",
    description: "Create a complete local storage implementation with error handling and data persistence.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 600,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<script>
  class StorageManager {
    constructor() {
      this.storage = window.localStorage;
      this.fallback = window.sessionStorage;
    }
    
    setItem(key, value) {
      try {
        this.storage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Local Storage error:', e.message);
        try {
          this.fallback.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          console.error('Session Storage error:', e.message);
          return false;
        }
      }
    }
    
    getItem(key) {
      try {
        const value = this.storage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (e) {
        console.error('Local Storage error:', e.message);
        try {
          const value = this.fallback.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (e) {
          console.error('Session Storage error:', e.message);
          return null;
        }
      }
    }
    
    removeItem(key) {
      try {
        this.storage.removeItem(key);
        return true;
      } catch (e) {
        console.error('Local Storage error:', e.message);
        try {
          this.fallback.removeItem(key);
          return true;
        } catch (e) {
          console.error('Session Storage error:', e.message);
          return false;
        }
      }
    }
    
    clear() {
      try {
        this.storage.clear();
        return true;
      } catch (e) {
        console.error('Local Storage error:', e.message);
        try {
          this.fallback.clear();
          return true;
        } catch (e) {
          console.error('Session Storage error:', e.message);
          return false;
        }
      }
    }
  }
</script>`,
    testCases: [
      { input: "Check if StorageManager class exists", output: "true" },
      { input: "Check if all methods are implemented", output: "true" },
      { input: "Check if error handling exists", output: "true" }
    ]
  },
  {
    title: "Create a Canvas Drawing Application",
    description: "Create a complete canvas drawing application with multiple shapes and colors.",
    language: "HTML",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "HTML5 Features",
    points: 20,
    timeLimit: 600,
    initialCode: `<!-- Add your code here -->`,
    code: `<!-- Add your code here -->`,
    solution: `<canvas id="drawingCanvas" width="400" height="300"></canvas>
<div class="controls">
  <button id="clearBtn">Clear</button>
  <input type="color" id="colorPicker" value="#000000">
  <select id="shapeSelect">
    <option value="rect">Rectangle</option>
    <option value="circle">Circle</option>
    <option value="line">Line</option>
  </select>
</div>

<script>
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let startX, startY;
  let currentShape = 'rect';
  let currentColor = '#000000';
  
  if (!ctx) {
    throw new Error('Could not get 2d context');
  }
  
  // Event Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  document.getElementById('clearBtn').addEventListener('click', clearCanvas);
  document.getElementById('colorPicker').addEventListener('change', updateColor);
  document.getElementById('shapeSelect').addEventListener('change', updateShape);
  
  function startDrawing(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = currentColor;
    
    switch (currentShape) {
      case 'rect':
        const width = e.offsetX - startX;
        const height = e.offsetY - startY;
        ctx.fillRect(startX, startY, width, height);
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(e.offsetX - startX, 2) +
          Math.pow(e.offsetY - startY, 2)
        );
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        break;
    }
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  function updateColor(e) {
    currentColor = e.target.value;
  }
  
  function updateShape(e) {
    currentShape = e.target.value;
  }
</script>`,
    testCases: [
      { input: "Check if canvas exists", output: "true" },
      { input: "Check if controls exist", output: "true" },
      { input: "Check if drawing functions exist", output: "true" }
    ]
  }
];

async function uploadQuestions() {
  try {
    const questionsRef = collection(db, 'questions');
    
    // Helper function to sanitize question data
    const sanitizeQuestionData = (question: any) => {
      // Ensure all string values are properly formatted
      const sanitized = {
        ...question,
        title: String(question.title),
        description: String(question.description),
        language: String(question.language),
        format: String(question.format),
        difficulty: String(question.difficulty),
        topic: String(question.topic),
        points: Number(question.points),
        timeLimit: Number(question.timeLimit),
        createdAt: createTimestamp(),
        updatedAt: createTimestamp()
      };

      // Format-specific sanitization
      if (question.format === 'MultipleChoice') {
        sanitized.options = question.options.map(String);
        sanitized.correctAnswer = Number(question.correctAnswer);
      } else if (question.format === 'DragAndDrop') {
        sanitized.codeSnippets = question.codeSnippets.map(String);
        sanitized.correctOrder = question.correctOrder.map(Number);
      } else if (question.format === 'FixTheCode') {
        sanitized.code = String(question.code);
        sanitized.solution = String(question.solution);
        sanitized.errorLine = Number(question.errorLine);
        sanitized.correctCode = String(question.correctCode);
      } else if (question.format === 'Subobjective') {
        sanitized.blanks = question.blanks.map(String);
        sanitized.answers = question.answers.map(String);
      } else if (question.format === 'AccomplishTask') {
        sanitized.initialCode = String(question.initialCode);
        sanitized.code = String(question.code);
        sanitized.solution = String(question.solution);
        sanitized.testCases = question.testCases.map((testCase: any) => ({
          input: String(testCase.input),
          output: String(testCase.output)
        }));
      }

      return sanitized;
    };

    // Upload Multiple Choice Questions
    console.log('Starting to upload Multiple Choice Questions...');
    for (const question of multipleChoiceQuestions) {
      try {
        const sanitizedData = sanitizeQuestionData(question);
        const docRef = await addDoc(questionsRef, sanitizedData);
        await updateDoc(docRef, { id: docRef.id });
        console.log(`Successfully uploaded Multiple Choice Question: ${docRef.id}`);
      } catch (error: any) {
        console.error(`Error uploading Multiple Choice Question: ${error?.message || 'Unknown error'}`);
        console.error('Question data:', JSON.stringify(question, null, 2));
      }
    }

    // Upload Drag and Drop Questions
    console.log('Starting to upload Drag and Drop Questions...');
    for (const question of dragAndDropQuestions) {
      try {
        const sanitizedData = sanitizeQuestionData(question);
        const docRef = await addDoc(questionsRef, sanitizedData);
        await updateDoc(docRef, { id: docRef.id });
        console.log(`Successfully uploaded Drag and Drop Question: ${docRef.id}`);
      } catch (error: any) {
        console.error(`Error uploading Drag and Drop Question: ${error?.message || 'Unknown error'}`);
        console.error('Question data:', JSON.stringify(question, null, 2));
      }
    }

    // Upload Fix the Code Questions
    console.log('Starting to upload Fix the Code Questions...');
    for (const question of fixTheCodeQuestions) {
      try {
        const sanitizedData = sanitizeQuestionData(question);
        const docRef = await addDoc(questionsRef, sanitizedData);
        await updateDoc(docRef, { id: docRef.id });
        console.log(`Successfully uploaded Fix the Code Question: ${docRef.id}`);
      } catch (error: any) {
        console.error(`Error uploading Fix the Code Question: ${error?.message || 'Unknown error'}`);
        console.error('Question data:', JSON.stringify(question, null, 2));
      }
    }

    // Upload Subobjective Questions
    console.log('Starting to upload Subobjective Questions...');
    for (const question of subobjectiveQuestions) {
      try {
        const sanitizedData = sanitizeQuestionData(question);
        const docRef = await addDoc(questionsRef, sanitizedData);
        await updateDoc(docRef, { id: docRef.id });
        console.log(`Successfully uploaded Subobjective Question: ${docRef.id}`);
      } catch (error: any) {
        console.error(`Error uploading Subobjective Question: ${error?.message || 'Unknown error'}`);
        console.error('Question data:', JSON.stringify(question, null, 2));
      }
    }

    // Upload Accomplish Task Questions
    console.log('Starting to upload Accomplish Task Questions...');
    for (const question of accomplishTaskQuestions) {
      try {
        const sanitizedData = sanitizeQuestionData(question);
        const docRef = await addDoc(questionsRef, sanitizedData);
        await updateDoc(docRef, { id: docRef.id });
        console.log(`Successfully uploaded Accomplish Task Question: ${docRef.id}`);
      } catch (error: any) {
        console.error(`Error uploading Accomplish Task Question: ${error?.message || 'Unknown error'}`);
        console.error('Question data:', JSON.stringify(question, null, 2));
      }
    }

    console.log('All questions uploaded successfully!');
  } catch (error: any) {
    console.error('Error in uploadQuestions:', error?.message || 'Unknown error');
  }
}

// Run the upload function
uploadQuestions(); 