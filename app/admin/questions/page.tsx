'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
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

export default function AdminQuestions() {
  const router = useRouter();
  const { user } = useAuth();
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
              {formData.codeSnippets.map((snippet, index) => (
                <div key={index} className="p-2 bg-muted rounded border cursor-move">
                  {snippet}
                </div>
              ))}
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
    if (!user) return;

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
        createdBy: user.uid,
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">Create Question</CardTitle>
            <Badge variant={formData.difficulty === 'Easy' ? 'secondary' : formData.difficulty === 'Medium' ? 'default' : 'destructive'}>
              {formData.difficulty}
            </Badge>
          </div>
          <p className="text-muted-foreground">Create a new coding challenge</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="edit" className="flex-1">
                Edit Question
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadPlaceholder}
                  className="w-full border-primary/20 hover:bg-primary/5"
                >
                  Load Example Question for {formData.format}
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <form id="question-form" onSubmit={(e) => {
                  e.preventDefault();
                  if (activeTab === 'preview') {
                    handleCreate(e);
                  } else {
                    handlePreview(e);
                  }
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label>Language</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value: Language) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Format</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value: QuestionFormat) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORMATS.map((format) => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Difficulty</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value: Difficulty) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map((diff) => (
                              <SelectItem key={diff} value={diff}>
                                {diff}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Topic</Label>
                        <Input
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Points</Label>
                          <Input
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Time Limit (seconds)</Label>
                          <Input
                            type="number"
                            value={formData.timeLimit}
                            onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.format === 'MultipleChoice' && (
                        <>
                          <div>
                            <Label>Question Code</Label>
                            <Textarea
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              className="font-mono"
                              rows={10}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Options</Label>
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
                              />
                            ))}
                          </div>
                          <div>
                            <Label>Correct Answer (0-based index)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={formData.options.length - 1}
                              value={formData.correctAnswer}
                              onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                              required
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

                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Confirm & Create
                  </Button>
                </form>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6 p-4 bg-card rounded-lg border border-primary/20">
                  <QuestionPreview />
                  
                  <div className="flex gap-4 sticky bottom-0 bg-background p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPreview(false);
                        setActiveTab('edit');
                      }}
                      className="flex-1"
                    >
                      Back to Edit
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
        <AlertDialogContent className="bg-background border-2 border-green-500 w-[95vw] max-w-[800px] h-[400px] flex flex-col justify-between">
          <AlertDialogHeader className="space-y-6 p-8">
            <AlertDialogTitle className="text-green-500 text-3xl font-bold">Success!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl leading-relaxed">
              Your question has been successfully created and added to the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-8 space-x-4">
            <AlertDialogAction 
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-lg"
              onClick={() => {
                setShowSuccessAlert(false);
                router.push('/admin/questions/list');
              }}
            >
              View Questions
            </AlertDialogAction>
            <AlertDialogAction 
              className="bg-primary hover:bg-primary/90 px-12 py-6 text-lg"
              onClick={() => setShowSuccessAlert(false)}
            >
              Create Another
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert */}
      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="bg-background border-2 border-destructive w-[95vw] max-w-[800px] h-[400px] flex flex-col justify-between">
          <AlertDialogHeader className="space-y-6 p-8">
            <AlertDialogTitle className="text-destructive text-3xl font-bold">Error</AlertDialogTitle>
            <AlertDialogDescription className="text-xl leading-relaxed">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-8">
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 text-white px-12 py-6 text-lg w-full"
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