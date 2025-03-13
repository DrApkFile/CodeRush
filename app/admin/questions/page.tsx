'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/src/lib/auth/admin';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const LANGUAGES: Language[] = [
  'Java',
  'Python',
  'C++',
  'C#',
  'JavaScript',
  'React',
  'Next.js',
  'TypeScript',
  'HTML',
  'CSS'
];

const LANGUAGE_TOPICS: Record<Language, string[]> = {
  'Java': [
    'Variables & Data Types',
    'Control Flow',
    'Arrays & Collections',
    'Object-Oriented Programming',
    'Exception Handling',
    'File I/O',
    'Multithreading',
    'Database Connectivity'
  ],
  'Python': [
    'Variables & Data Types',
    'Control Flow',
    'Lists & Dictionaries',
    'Functions & Modules',
    'Object-Oriented Programming',
    'File Handling',
    'Regular Expressions',
    'Data Structures'
  ],
  'C++': [
    'Variables & Data Types',
    'Control Flow',
    'Arrays & Strings',
    'Pointers & References',
    'Object-Oriented Programming',
    'STL',
    'Memory Management',
    'Templates'
  ],
  'C#': [
    'Variables & Data Types',
    'Control Flow',
    'Arrays & Collections',
    'Object-Oriented Programming',
    'LINQ',
    'File I/O',
    'Windows Forms',
    'ASP.NET Core'
  ],
  'JavaScript': [
    'Variables & Data Types',
    'Control Flow',
    'Arrays & Objects',
    'Functions & Closures',
    'DOM Manipulation',
    'Event Handling',
    'Async Programming',
    'ES6+ Features'
  ],
  'React': [
    'Components & Props',
    'State & Lifecycle',
    'Hooks',
    'Event Handling',
    'Forms & Validation',
    'Routing',
    'Context API',
    'Redux'
  ],
  'Next.js': [
    'Pages & Routing',
    'Data Fetching',
    'Server Components',
    'API Routes',
    'Static Generation',
    'Server-Side Rendering',
    'Authentication',
    'Deployment'
  ],
  'TypeScript': [
    'Types & Interfaces',
    'Generics',
    'Classes & Inheritance',
    'Modules',
    'Type Guards',
    'Decorators',
    'Advanced Types',
    'TypeScript with React'
  ],
  'HTML': [
    'Elements & Tags',
    'Forms & Input',
    'Tables & Lists',
    'Semantic HTML',
    'Multimedia',
    'Accessibility',
    'SEO Basics',
    'HTML5 Features'
  ],
  'CSS': [
    'Selectors & Specificity',
    'Box Model',
    'Flexbox',
    'Grid',
    'Responsive Design',
    'Animations',
    'CSS Variables',
    'CSS Preprocessors'
  ]
};

const FORMATS: QuestionFormat[] = [
  'DragAndDrop',
  'FixTheCode',
  'MultipleChoice',
  'Subobjective',
  'AccomplishTask'
];

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const PLACEHOLDER_QUESTIONS: Record<QuestionFormat, Question> = {
  MultipleChoice: {
    id: 'placeholder-multiple-choice',
    title: "Understanding JavaScript Closures",
    description: "What will be the output of the following code?",
    language: "JavaScript",
    format: "MultipleChoice",
    difficulty: "Medium",
    topic: "Closures",
    points: 10,
    timeLimit: 300,
    code: `function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  }
}
const counter = createCounter();
console.log(counter());
console.log(counter());`,
    options: ["1, 1", "1, 2", "2, 1", "undefined, undefined"],
    correctAnswer: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  } as MultipleChoiceQuestion,
  
  DragAndDrop: {
    id: 'placeholder-drag-and-drop',
    title: "Order React Component Lifecycle Methods",
    description: "Arrange the following React component lifecycle methods in the correct order of execution.",
    language: "JavaScript",
    format: "DragAndDrop",
    difficulty: "Easy",
    topic: "React Lifecycle",
    points: 8,
    timeLimit: 240,
    code: "",
    codeSnippets: [
      "componentDidMount()",
      "constructor()",
      "render()",
      "componentWillUnmount()"
    ],
    correctOrder: [1, 0, 2, 3],
    createdAt: new Date(),
    updatedAt: new Date()
  } as DragAndDropQuestion,
  
  FixTheCode: {
    id: 'placeholder-fix-the-code',
    title: "Fix the Python List Comprehension",
    description: "Fix the errors in the following Python list comprehension code.",
    language: "Python",
    format: "FixTheCode",
    difficulty: "Hard",
    topic: "List Comprehension",
    points: 15,
    timeLimit: 360,
    code: `numbers = [1, 2, 3, 4, 5]
squares = [num * num in numbers]
print(squares)`,
    solution: `numbers = [1, 2, 3, 4, 5]
squares = [num * num for num in numbers]
print(squares)`,
    errorLine: 2,
    correctCode: `numbers = [1, 2, 3, 4, 5]
squares = [num * num for num in numbers]
print(squares)`,
    createdAt: new Date(),
    updatedAt: new Date()
  } as FixTheCodeQuestion,
  
  Subobjective: {
    id: 'placeholder-subobjective',
    title: "Complete the TypeScript Interface",
    description: "Fill in the blanks to complete the TypeScript interface definition.",
    language: "TypeScript",
    format: "Subobjective",
    difficulty: "Medium",
    topic: "TypeScript Interfaces",
    points: 12,
    timeLimit: 300,
    code: `interface User {
  id: ____;
  name: ____;
  age?: ____;
  email: ____;
}`,
    blanks: ["string", "string", "number", "string"],
    answers: ["string", "string", "number", "string"],
    createdAt: new Date(),
    updatedAt: new Date()
  } as SubobjectiveQuestion,
  
  AccomplishTask: {
    id: 'placeholder-accomplish-task',
    title: "Implement a Stack Data Structure",
    description: "Implement a Stack class with push, pop, and peek methods using an array.",
    language: "JavaScript",
    format: "AccomplishTask",
    difficulty: "Hard",
    topic: "Data Structures",
    points: 20,
    timeLimit: 600,
    initialCode: `class Stack {
  constructor() {
    this.items = [];
  }
  
  // TODO: Implement push method
  
  // TODO: Implement pop method
  
  // TODO: Implement peek method
}`,
    code: `class Stack {
  constructor() {
    this.items = [];
  }
  
  // TODO: Implement push method
  
  // TODO: Implement pop method
  
  // TODO: Implement peek method
}`,
    solution: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.items.length === 0) return null;
    return this.items.pop();
  }
  
  peek() {
    if (this.items.length === 0) return null;
    return this.items[this.items.length - 1];
  }
}`,
    testCases: [
      { input: "const stack = new Stack(); stack.push(1); stack.peek();", output: "1" },
      { input: "const stack = new Stack(); stack.pop();", output: "null" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  } as AccomplishTaskQuestion
};

const POINTS_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const TIME_LIMIT_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function AdminQuestions() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript' as Language,
    format: 'MultipleChoice' as QuestionFormat,
    difficulty: 'Medium' as Difficulty,
    topic: '',
    points: 100,
    timeLimit: 300,
    code: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    codeSnippets: [''],
    correctOrder: [0],
    blanks: [''],
    answers: [''],
    testCases: [{ input: '', output: '' }],
    solution: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
    }
  }, [router]);

  const loadPlaceholder = () => {
    const placeholder = PLACEHOLDER_QUESTIONS[formData.format];
    if (placeholder) {
      setFormData({
        ...formData,
        ...placeholder
      });
    }
  };

  const QuestionPreview = () => {
    switch (formData.format) {
      case 'MultipleChoice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{formData.title}</h3>
            <p>{formData.description}</p>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code>{formData.code}</code>
            </pre>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name="preview" disabled />
                  <label>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'DragAndDrop':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{formData.title}</h3>
            <p>{formData.description}</p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Drag from here:</h4>
                  <div className="space-y-2">
                    {formData.codeSnippets.map((snippet, index) => (
                      <div
                        key={`source-${index}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        className="p-2 bg-muted rounded border cursor-move hover:bg-muted/80 transition-colors"
                      >
                        {snippet}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Drop here:</h4>
                  <div className="space-y-2">
                    {Array(formData.codeSnippets.length).fill(null).map((_, index) => (
                      <div
                        key={`target-${index}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-primary/10');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-primary/10');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-primary/10');
                          const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          const newOrder = [...formData.correctOrder];
                          newOrder[index] = sourceIndex;
                          setFormData({ ...formData, correctOrder: newOrder });
                        }}
                        className="p-2 bg-muted/50 rounded border border-dashed min-h-[2.5rem]"
                      >
                        {formData.correctOrder[index] !== undefined && (
                          <div className="p-2 bg-muted rounded">
                            {formData.codeSnippets[formData.correctOrder[index]]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'FixTheCode':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{formData.title}</h3>
            <p>{formData.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Code with Errors:</h4>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code>{formData.code}</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Expected Solution:</h4>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code>{formData.solution}</code>
                </pre>
              </div>
            </div>
          </div>
        );

      case 'Subobjective':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{formData.title}</h3>
            <p>{formData.description}</p>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code>{formData.code}</code>
            </pre>
            <div className="grid grid-cols-2 gap-4">
              {formData.blanks.map((_, index) => (
                <Input
                  key={index}
                  placeholder={`Answer ${index + 1}`}
                  disabled
                />
              ))}
            </div>
          </div>
        );

      case 'AccomplishTask':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{formData.title}</h3>
            <p>{formData.description}</p>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code>{formData.code}</code>
            </pre>
            <div className="space-y-2">
              <h4 className="font-medium">Test Cases:</h4>
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-muted rounded">
                    Input: {testCase.input}
                  </div>
                  <div className="p-2 bg-muted rounded">
                    Expected: {testCase.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
    setActiveTab('preview');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const baseQuestionData = {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        format: formData.format,
        difficulty: formData.difficulty,
        topic: formData.topic,
        points: formData.points,
        timeLimit: formData.timeLimit,
        code: formData.code,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Cast the question data based on format
      let typedQuestionData;
      switch (formData.format) {
        case 'MultipleChoice':
          typedQuestionData = {
            ...baseQuestionData,
            options: formData.options,
            correctAnswer: formData.correctAnswer,
          };
          break;
        case 'DragAndDrop':
          typedQuestionData = {
            ...baseQuestionData,
            codeSnippets: formData.codeSnippets,
            correctOrder: formData.correctOrder,
          };
          break;
        case 'FixTheCode':
          typedQuestionData = {
            ...baseQuestionData,
            code: formData.code,
            solution: formData.solution,
            errorLine: formData.code.split('\n').findIndex((line, index) => 
              line !== formData.solution.split('\n')[index]
            ),
            correctCode: formData.solution,
          };
          break;
        case 'Subobjective':
          typedQuestionData = {
            ...baseQuestionData,
            blanks: formData.blanks,
            answers: formData.answers,
          };
          break;
        case 'AccomplishTask':
          typedQuestionData = {
            ...baseQuestionData,
            initialCode: formData.code,
            code: formData.code,
            solution: formData.solution,
            testCases: formData.testCases,
          };
          break;
      }

      const questionsRef = collection(db, 'questions');
      const docRef = await addDoc(questionsRef, typedQuestionData);

      // Update the document with its ID
      await updateDoc(docRef, { id: docRef.id });

      console.log('Question created with ID:', docRef.id);
      setShowSuccessAlert(true);

      // Reset form and preview state after a short delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          language: 'JavaScript',
          format: 'MultipleChoice',
          difficulty: 'Medium',
          topic: '',
          points: 100,
          timeLimit: 300,
          code: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          codeSnippets: [''],
          correctOrder: [0],
          blanks: [''],
          answers: [''],
          testCases: [{ input: '', output: '' }],
          solution: '',
        });
        setShowPreview(false);
        setActiveTab('edit');
      }, 1500);
    } catch (error) {
      console.error('Error creating question:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create question');
      setShowErrorAlert(true);
    }
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="border-primary/20">
        <CardHeader className="space-y-1 bg-primary/5 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Create Question</CardTitle>
            <Badge variant={formData.difficulty === 'Easy' ? 'secondary' : formData.difficulty === 'Medium' ? 'default' : 'destructive'}>
              {formData.difficulty}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Create a new coding challenge</p>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
            <TabsList className="mb-4 w-full flex flex-col sm:flex-row">
              <TabsTrigger value="edit" className="flex-1 text-sm sm:text-base">
                Edit Question
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 text-sm sm:text-base">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <div className="mb-4 sm:mb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadPlaceholder}
                  className="w-full text-sm sm:text-base border-primary/20 hover:bg-primary/5"
                >
                  Load Example Question for {formData.format}
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <form id="question-form" onSubmit={handlePreview} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-sm sm:text-base">Title</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Language</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value: Language) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang} className="text-sm sm:text-base">
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Format</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value: QuestionFormat) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORMATS.map((format) => (
                              <SelectItem key={format} value={format} className="text-sm sm:text-base">
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Difficulty</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value: Difficulty) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map((diff) => (
                              <SelectItem key={diff} value={diff} className="text-sm sm:text-base">
                                {diff}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Topic</Label>
                        <Select
                          value={formData.topic}
                          onValueChange={(value) => setFormData({ ...formData, topic: value })}
                        >
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_TOPICS[formData.language].map((topic) => (
                              <SelectItem key={topic} value={topic} className="text-sm sm:text-base">
                                {topic}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-sm sm:text-base">Points</Label>
                          <Select
                            value={formData.points.toString()}
                            onValueChange={(value) => setFormData({ ...formData, points: Number(value) })}
                          >
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {POINTS_OPTIONS.map((point) => (
                                <SelectItem key={point} value={point.toString()} className="text-sm sm:text-base">
                                  {point} point{point !== 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm sm:text-base">Time Limit (seconds)</Label>
                          <Select
                            value={formData.timeLimit.toString()}
                            onValueChange={(value) => setFormData({ ...formData, timeLimit: Number(value) })}
                          >
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_LIMIT_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time.toString()} className="text-sm sm:text-base">
                                  {time} second{time !== 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {formData.format === 'MultipleChoice' && (
                        <>
                          <div>
                            <Label className="text-sm sm:text-base">Question Code</Label>
                            <Textarea
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              className="font-mono text-sm sm:text-base"
                              rows={10}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Options</Label>
                            {formData.options.map((option, index) => (
                              <Input
                                key={index}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...formData.options];
                                  newOptions[index] = e.target.value;
                                  setFormData({ ...formData, options: newOptions });
                                }}
                                placeholder={`Option ${index + 1}`}
                                required
                                className="text-sm sm:text-base"
                              />
                            ))}
                          </div>
                          <div>
                            <Label className="text-sm sm:text-base">Correct Answer (0-based index)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={formData.options.length - 1}
                              value={formData.correctAnswer}
                              onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                              required
                              className="text-sm sm:text-base"
                            />
                          </div>
                        </>
                      )}

                      {formData.format === 'DragAndDrop' && (
                        <div className="space-y-4">
                          <Label>Code Snippets (one per line)</Label>
                          <Textarea
                            value={formData.codeSnippets.join('\n')}
                            onChange={(e) => setFormData({
                              ...formData,
                              codeSnippets: e.target.value.split('\n'),
                              correctOrder: Array.from({ length: e.target.value.split('\n').length }, (_, i) => i)
                            })}
                            className="font-mono"
                            rows={10}
                            required
                          />
                          <div>
                            <Label>Correct Order (comma-separated indices, starting from 0)</Label>
                            <Input
                              value={formData.correctOrder.join(', ')}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty input
                                if (!value) {
                                  setFormData({
                                    ...formData,
                                    correctOrder: []
                                  });
                                  return;
                                }
                                // Split by comma and handle each number
                                const order = value
                                  .split(',')
                                  .map(num => parseInt(num.trim()))
                                  .filter(num => !isNaN(num));
                                setFormData({
                                  ...formData,
                                  correctOrder: order
                                });
                              }}
                              placeholder="0, 1, 2, 3"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {formData.format === 'FixTheCode' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Code with Error</Label>
                            <Textarea
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                          <div>
                            <Label>Correct Code</Label>
                            <Textarea
                              value={formData.solution}
                              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {formData.format === 'Subobjective' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Code with Blanks (use ___ for blanks)</Label>
                            <Textarea
                              value={formData.code}
                              onChange={(e) => {
                                const blanksCount = (e.target.value.match(/___/g) || []).length;
                                setFormData({
                                  ...formData,
                                  code: e.target.value,
                                  blanks: Array(blanksCount).fill(''),
                                  answers: Array(blanksCount).fill('')
                                });
                              }}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Answers for Blanks</Label>
                            {formData.blanks.map((_, index) => (
                              <Input
                                key={index}
                                value={formData.answers[index]}
                                onChange={(e) => {
                                  const newAnswers = [...formData.answers];
                                  newAnswers[index] = e.target.value;
                                  setFormData({ ...formData, answers: newAnswers });
                                }}
                                placeholder={`Answer for blank ${index + 1}`}
                                required
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.format === 'AccomplishTask' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Initial Code</Label>
                            <Textarea
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                          <div>
                            <Label>Solution</Label>
                            <Textarea
                              value={formData.solution}
                              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Test Cases</Label>
                            {formData.testCases.map((testCase, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  value={testCase.input}
                                  onChange={(e) => {
                                    const newTestCases = [...formData.testCases];
                                    newTestCases[index].input = e.target.value;
                                    setFormData({ ...formData, testCases: newTestCases });
                                  }}
                                  placeholder="Input"
                                  required
                                />
                                <Input
                                  value={testCase.output}
                                  onChange={(e) => {
                                    const newTestCases = [...formData.testCases];
                                    newTestCases[index].output = e.target.value;
                                    setFormData({ ...formData, testCases: newTestCases });
                                  }}
                                  placeholder="Expected Output"
                                  required
                                />
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setFormData({
                                ...formData,
                                testCases: [...formData.testCases, { input: '', output: '' }]
                              })}
                            >
                              Add Test Case
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-sm sm:text-base">
                    Preview Question
                  </Button>
                </form>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-card rounded-lg border border-primary/20">
                  <QuestionPreview />
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-background p-3 sm:p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPreview(false);
                        setActiveTab('edit');
                      }}
                      className="flex-1 text-sm sm:text-base"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreate}
                      className="flex-1 text-sm sm:text-base bg-primary hover:bg-primary/90"
                    >
                      Confirm & Create
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Alert */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="bg-background border-2 border-green-500 w-[90vw] max-w-[500px] h-[300px] flex flex-col justify-between">
          <AlertDialogHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <AlertDialogTitle className="text-green-500 text-xl sm:text-2xl font-bold">Success!</AlertDialogTitle>
            <AlertDialogDescription className="text-base sm:text-lg leading-relaxed">
              Your question has been successfully created and added to the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-4 sm:p-6 space-y-2 sm:space-y-0 sm:space-x-4">
            <AlertDialogAction 
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
              onClick={() => {
                setShowSuccessAlert(false);
                router.push('/admin/questions/list');
              }}
            >
              View Questions
            </AlertDialogAction>
            <AlertDialogAction 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
              onClick={() => setShowSuccessAlert(false)}
            >
              Create Another
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert */}
      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="bg-background border-2 border-destructive w-[90vw] max-w-[500px] h-[300px] flex flex-col justify-between">
          <AlertDialogHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <AlertDialogTitle className="text-destructive text-xl sm:text-2xl font-bold">Error</AlertDialogTitle>
            <AlertDialogDescription className="text-base sm:text-lg leading-relaxed">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-4 sm:p-6">
            <AlertDialogAction 
              className="w-full bg-destructive hover:bg-destructive/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
              onClick={() => setShowErrorAlert(false)}
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 