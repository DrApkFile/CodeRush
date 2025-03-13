'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { isAdmin } from '@/src/lib/auth/admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import type { Question, Language, QuestionFormat, Difficulty } from '@/src/types/questions';
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

export default function EditQuestion({ params }: { params: { id: string } }) {
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

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
      return;
    }

    fetchQuestion();
  }, [router, params.id]);

  const fetchQuestion = async () => {
    try {
      const questionDoc = await getDoc(doc(db, 'questions', params.id));
      if (!questionDoc.exists()) {
        toast({
          title: "Error",
          description: "Question not found",
          variant: "destructive",
        });
        router.push('/admin/questions/list');
        return;
      }

      const questionData = questionDoc.data() as Question;
      setFormData({
        ...formData,
        ...questionData,
        options: questionData.format === 'MultipleChoice' 
          ? (questionData as any).options || ['', '', '', '']
          : ['', '', '', ''],
        codeSnippets: questionData.format === 'DragAndDrop'
          ? (questionData as any).codeSnippets || ['']
          : [''],
        correctOrder: questionData.format === 'DragAndDrop'
          ? (questionData as any).correctOrder || [0]
          : [0],
        blanks: questionData.format === 'Subobjective'
          ? (questionData as any).blanks || ['']
          : [''],
        answers: questionData.format === 'Subobjective'
          ? (questionData as any).answers || ['']
          : [''],
        testCases: questionData.format === 'AccomplishTask'
          ? (questionData as any).testCases || [{ input: '', output: '' }]
          : [{ input: '', output: '' }],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch question",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const questionData = {
        ...formData,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'questions', params.id), questionData);

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      router.push('/admin/questions/list');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/questions/list')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 