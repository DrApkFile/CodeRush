'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { isAdmin } from '@/src/lib/auth/admin';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import type { Question, Language, QuestionFormat, Difficulty } from '@/src/types/questions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BaseQuestionWithId = {
  id: string;
  title: string;
  description: string;
  language: Language;
  format: QuestionFormat;
  difficulty: Difficulty;
  topic: string;
  points: number;
  timeLimit: number;
  code: string;
  createdAt: Date;
  updatedAt: Date;
};

type QuestionWithId = BaseQuestionWithId & {
  options: string[];
  correctAnswer: number;
  codeSnippets: string[];
  correctOrder: number[];
  blanks: string[];
  answers: string[];
  testCases: { input: string; output: string }[];
  solution: string;
};

export default function QuestionList() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<QuestionWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    language: '',
    difficulty: '',
    format: '',
    search: '',
  });
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
      return;
    }

    fetchQuestions();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionWithId[];

      setQuestions(fetchedQuestions);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch questions');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      setQuestions(questions.filter(q => q.id !== questionId));
      setShowSuccessAlert(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete question');
      setShowErrorAlert(true);
    }
    setDeleteQuestionId(null);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesLanguage = !filter.language || filter.language === 'all' || q.language === filter.language;
    const matchesDifficulty = !filter.difficulty || filter.difficulty === 'all' || q.difficulty === filter.difficulty;
    const matchesFormat = !filter.format || filter.format === 'all' || q.format === filter.format;
    const matchesSearch = !filter.search || 
      q.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      q.description.toLowerCase().includes(filter.search.toLowerCase()) ||
      q.topic.toLowerCase().includes(filter.search.toLowerCase());

    return matchesLanguage && matchesDifficulty && matchesFormat && matchesSearch;
  });

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'Hard':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-primary/10 text-primary hover:bg-primary/20';
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
            <CardTitle className="text-2xl font-bold text-primary">Question List</CardTitle>
            <Button
              onClick={() => router.push('/admin/questions')}
              className="bg-primary hover:bg-primary/90"
            >
              Create New Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="w-full">
                <Input
                  placeholder="Search questions..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="border-primary/20 w-full"
                />
              </div>
              <div className="w-full">
                <Select
                  value={filter.language}
                  onValueChange={(value) => setFilter({ ...filter, language: value })}
                >
                  <SelectTrigger className="border-primary/20 w-full">
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {Array.from(new Set(questions.map(q => q.language))).map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <Select
                  value={filter.difficulty}
                  onValueChange={(value) => setFilter({ ...filter, difficulty: value })}
                >
                  <SelectTrigger className="border-primary/20 w-full">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <Select
                  value={filter.format}
                  onValueChange={(value) => setFilter({ ...filter, format: value })}
                >
                  <SelectTrigger className="border-primary/20 w-full">
                    <SelectValue placeholder="Filter by format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="DragAndDrop">Drag and Drop</SelectItem>
                    <SelectItem value="FixTheCode">Fix the Code</SelectItem>
                    <SelectItem value="MultipleChoice">Multiple Choice</SelectItem>
                    <SelectItem value="Subobjective">Subobjective</SelectItem>
                    <SelectItem value="AccomplishTask">Accomplish Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8">No questions found</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Title</TableHead>
                        <TableHead className="min-w-[120px]">Language</TableHead>
                        <TableHead className="min-w-[120px]">Format</TableHead>
                        <TableHead className="min-w-[100px]">Difficulty</TableHead>
                        <TableHead className="min-w-[150px]">Topic</TableHead>
                        <TableHead className="min-w-[80px]">Points</TableHead>
                        <TableHead className="min-w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium whitespace-nowrap">{question.title}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="border-primary/20">
                              {question.language}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="border-primary/20">
                              {question.format}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{question.topic}</TableCell>
                          <TableCell className="whitespace-nowrap">{question.points}</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/questions/edit/${question.id}`)}
                                className="border-primary/20 hover:bg-primary/5 w-full sm:w-auto"
                              >
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteQuestionId(question.id)}
                                    className="w-full sm:w-auto"
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-background">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setDeleteQuestionId(null)}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => deleteQuestionId && handleDelete(deleteQuestionId)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Alert */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-500">Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Question has been successfully deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-green-500 hover:bg-green-600">
              Continue
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
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 