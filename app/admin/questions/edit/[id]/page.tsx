'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { isAdmin } from '@/src/lib/auth/admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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

type QuestionWithId = Question & {
  id: string;
};

export default function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<QuestionWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
      return;
    }

    fetchQuestion();
  }, [id, router]);

  const fetchQuestion = async () => {
    try {
      const questionRef = doc(db, 'questions', id);
      const questionDoc = await getDoc(questionRef);
      
      if (questionDoc.exists()) {
        setFormData({
          id: questionDoc.id,
          ...questionDoc.data()
        } as QuestionWithId);
      } else {
        setErrorMessage('Question not found');
        setShowErrorAlert(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch question');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
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

      await updateDoc(doc(db, 'questions', id), questionData);

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

  const handleInputChange = (field: keyof QuestionWithId, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleQuestionSpecificChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    } as QuestionWithId);
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="border-primary/20">
        <CardHeader className="space-y-1 bg-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">Edit Question</CardTitle>
            <Button
              onClick={() => router.push('/admin/questions/list')}
              variant="outline"
              className="border-primary/20 hover:bg-primary/5"
            >
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8">Loading question...</div>
          ) : formData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleQuestionSpecificChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleQuestionSpecificChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value: Language) => handleQuestionSpecificChange('language', value)}
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
                      onValueChange={(value: QuestionFormat) => handleQuestionSpecificChange('format', value)}
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
                      onValueChange={(value: Difficulty) => handleQuestionSpecificChange('difficulty', value)}
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
                      onChange={(e) => handleQuestionSpecificChange('topic', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={formData.points}
                        onChange={(e) => handleQuestionSpecificChange('points', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Time Limit (seconds)</Label>
                      <Input
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) => handleQuestionSpecificChange('timeLimit', Number(e.target.value))}
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
                          onChange={(e) => handleQuestionSpecificChange('code', e.target.value)}
                          className="font-mono"
                          rows={10}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {(formData as MultipleChoiceQuestion).options.map((option: string, index: number) => (
                          <Input
                            key={index}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(formData as MultipleChoiceQuestion).options];
                              newOptions[index] = e.target.value;
                              handleQuestionSpecificChange('options', newOptions);
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
                          max={(formData as MultipleChoiceQuestion).options.length - 1}
                          value={(formData as MultipleChoiceQuestion).correctAnswer}
                          onChange={(e) => handleQuestionSpecificChange('correctAnswer', Number(e.target.value))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {formData.format === 'DragAndDrop' && (
                    <div className="space-y-4">
                      <Label>Code Snippets (one per line)</Label>
                      <Textarea
                        value={(formData as DragAndDropQuestion).codeSnippets.join('\n')}
                        onChange={(e) => handleQuestionSpecificChange('codeSnippets', e.target.value.split('\n'))}
                        className="font-mono"
                        rows={10}
                        required
                      />
                      <div>
                        <Label>Correct Order (comma-separated indices, starting from 0)</Label>
                        <Input
                          value={(formData as DragAndDropQuestion).correctOrder.join(', ')}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) {
                              handleQuestionSpecificChange('correctOrder', []);
                              return;
                            }
                            const order = value
                              .split(',')
                              .map(num => parseInt(num.trim()))
                              .filter(num => !isNaN(num));
                            handleQuestionSpecificChange('correctOrder', order);
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
                          onChange={(e) => handleQuestionSpecificChange('code', e.target.value)}
                          className="font-mono"
                          rows={10}
                          required
                        />
                      </div>
                      <div>
                        <Label>Correct Code</Label>
                        <Textarea
                          value={(formData as FixTheCodeQuestion).correctCode}
                          onChange={(e) => handleQuestionSpecificChange('correctCode', e.target.value)}
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
                            handleQuestionSpecificChange('code', e.target.value);
                            handleQuestionSpecificChange('blanks', Array(blanksCount).fill(''));
                            handleQuestionSpecificChange('answers', Array(blanksCount).fill(''));
                          }}
                          className="font-mono"
                          rows={10}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answers for Blanks</Label>
                        {(formData as SubobjectiveQuestion).blanks.map((_: string, index: number) => (
                          <Input
                            key={index}
                            value={(formData as SubobjectiveQuestion).answers[index]}
                            onChange={(e) => {
                              const newAnswers = [...(formData as SubobjectiveQuestion).answers];
                              newAnswers[index] = e.target.value;
                              handleQuestionSpecificChange('answers', newAnswers);
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
                      <div className="space-y-2">
                        <Label>Initial Code</Label>
                        <Textarea
                          value={(formData as AccomplishTaskQuestion).initialCode}
                          onChange={(e) => handleQuestionSpecificChange('initialCode', e.target.value)}
                          className="font-mono"
                          rows={10}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Solution</Label>
                        <Textarea
                          value={(formData as AccomplishTaskQuestion).solution}
                          onChange={(e) => handleQuestionSpecificChange('solution', e.target.value)}
                          className="font-mono"
                          rows={10}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Test Cases</Label>
                        {(formData as AccomplishTaskQuestion).testCases.map((testCase: { input: string; output: string }, index: number) => (
                          <div key={index} className="grid grid-cols-2 gap-2">
                            <Input
                              value={testCase.input}
                              onChange={(e) => {
                                const newTestCases = [...(formData as AccomplishTaskQuestion).testCases];
                                newTestCases[index].input = e.target.value;
                                handleQuestionSpecificChange('testCases', newTestCases);
                              }}
                              placeholder="Input"
                              required
                            />
                            <Input
                              value={testCase.output}
                              onChange={(e) => {
                                const newTestCases = [...(formData as AccomplishTaskQuestion).testCases];
                                newTestCases[index].output = e.target.value;
                                handleQuestionSpecificChange('testCases', newTestCases);
                              }}
                              placeholder="Expected Output"
                              required
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newTestCases = [...(formData as AccomplishTaskQuestion).testCases, { input: '', output: '' }];
                            handleQuestionSpecificChange('testCases', newTestCases);
                          }}
                        >
                          Add Test Case
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">Question not found</div>
          )}
        </CardContent>
      </Card>

      {/* Success Alert */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-500">Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Question has been successfully updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setShowSuccessAlert(false);
                router.push('/admin/questions/list');
              }}
            >
              View Questions
            </AlertDialogAction>
            <AlertDialogAction 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowSuccessAlert(false)}
            >
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert */}
      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 