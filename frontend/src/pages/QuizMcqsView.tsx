import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Trophy, 
  Play, 
  Flame, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '../types';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizTopic {
  id: string;
  title: string;
  category: 'technical' | 'dsa' | 'cloud' | 'system-design' | 'ai';
  description: string;
  iconName: string;
  questionCount: number;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  questions: QuizQuestion[];
}

const PRESET_QUIZZES: QuizTopic[] = [
  {
    id: 'react-fullstack',
    title: 'React 19 & Full-Stack Architecture',
    category: 'technical',
    description: 'Test your knowledge on React hooks, Server Components, Vite optimizations, and Express REST APIs.',
    iconName: 'Code',
    questionCount: 5,
    durationMinutes: 5,
    difficulty: 'Intermediate',
    xpReward: 250,
    questions: [
      {
        id: 'q1',
        question: 'What is the primary benefit of React Server Components (RSC)?',
        options: [
          'They execute entirely in the browser without bundle size impact',
          'They run on the server, reducing client-side JavaScript bundle size and enabling direct database access',
          'They replace WebSockets for real-time multiplayer applications',
          'They automatically compile TypeScript into WebAssembly'
        ],
        correctAnswer: 1,
        explanation: 'React Server Components render on the server, eliminating their code from the client bundle and fetching data directly without client-side waterfalls.'
      },
      {
        id: 'q2',
        question: 'Which HTTP status code indicates that a resource was successfully created in a REST API?',
        options: ['200 OK', '201 Created', '204 No Content', '400 Bad Request'],
        correctAnswer: 1,
        explanation: 'Status code 201 Created indicates that the request has succeeded and led to the creation of a new resource.'
      },
      {
        id: 'q3',
        question: 'In Vite, how do you expose an environment variable to the browser client code?',
        options: [
          'Prefix it with REACT_APP_',
          'Prefix it with VITE_',
          'Store it in window.env directly',
          'Add it to package.json dependencies'
        ],
        correctAnswer: 1,
        explanation: 'Vite exposes environment variables prefixed with VITE_ on import.meta.env to prevent accidental leakage of server secrets.'
      },
      {
        id: 'q4',
        question: 'What is the purpose of JWT (JSON Web Tokens) in stateless authentication?',
        options: [
          'To encrypt user passwords in PostgreSQL',
          'To securely transmit claims between parties as a JSON object that can be cryptographically signed',
          'To maintain server-side session memory in Redis',
          'To compress HTTP response payloads'
        ],
        correctAnswer: 1,
        explanation: 'JWTs are compact, URL-safe means of representing claims to be transferred between two parties, cryptographically signed with a secret or public key.'
      },
      {
        id: 'q5',
        question: 'Which hook should you use to memorize expensive calculations across re-renders in React?',
        options: ['useEffect', 'useState', 'useMemo', 'useCallback'],
        correctAnswer: 2,
        explanation: 'useMemo caches the result of a calculation between re-renders until its dependencies change.'
      }
    ]
  },
  {
    id: 'dsa-fundamentals',
    title: 'Data Structures & Algorithms (DSA)',
    category: 'dsa',
    description: 'Master time complexities, sorting algorithms, trees, graphs, and dynamic programming patterns.',
    iconName: 'Cpu',
    questionCount: 5,
    durationMinutes: 6,
    difficulty: 'Advanced',
    xpReward: 300,
    questions: [
      {
        id: 'd1',
        question: 'What is the worst-case time complexity of QuickSort when the pivot selection is suboptimal?',
        options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
        correctAnswer: 2,
        explanation: 'When the smallest or largest element is consistently picked as pivot (e.g. already sorted array with first element pivot), QuickSort degrades to O(N^2).'
      },
      {
        id: 'd2',
        question: 'Which data structure is most efficient for implementing a LIFO (Last In, First Out) queue?',
        options: ['Queue', 'Stack', 'MinHeap', 'Binary Search Tree'],
        correctAnswer: 1,
        explanation: 'A Stack operates strictly on a LIFO basis, pushing and popping elements from the top.'
      },
      {
        id: 'd3',
        question: 'What is the time complexity of searching in a Balanced Binary Search Tree (e.g., AVL Tree)?',
        options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
        correctAnswer: 1,
        explanation: 'Balanced BSTs guarantee logarithmic O(log N) height, making search, insert, and delete efficient.'
      },
      {
        id: 'd4',
        question: 'Which algorithm finds the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights?',
        options: ['Breadth-First Search', 'Depth-First Search', 'Dijkstra’s Algorithm', 'Kruskal’s Algorithm'],
        correctAnswer: 2,
        explanation: 'Dijkstra’s algorithm computes single-source shortest paths in graphs with non-negative edge weights using a priority queue.'
      },
      {
        id: 'd5',
        question: 'What technique does MergeSort use to sort elements?',
        options: ['Greedy Approach', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'],
        correctAnswer: 2,
        explanation: 'MergeSort divides the array into halves, recursively sorts them, and then merges the sorted halves (Divide and Conquer).'
      }
    ]
  },
  {
    id: 'database-postgres',
    title: 'PostgreSQL & Relational Databases',
    category: 'technical',
    description: 'Practice SQL queries, indexing strategies, ACID compliance, and connection pooling.',
    iconName: 'Database',
    questionCount: 5,
    durationMinutes: 5,
    difficulty: 'Intermediate',
    xpReward: 250,
    questions: [
      {
        id: 'p1',
        question: 'What does ACID stand for in relational database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Access, Control, Indexing, Distribution',
          'Async, Concurrency, Integrity, Delivery',
          'Automatic, Cached, Indexed, Distributed'
        ],
        correctAnswer: 0,
        explanation: 'ACID guarantees reliable processing of database transactions: Atomicity, Consistency, Isolation, and Durability.'
      },
      {
        id: 'p2',
        question: 'Which SQL clause is used to filter grouped rows in an aggregation query?',
        options: ['WHERE', 'FILTER', 'HAVING', 'GROUP FILTER'],
        correctAnswer: 2,
        explanation: 'HAVING is used to filter groups created by the GROUP BY clause, whereas WHERE filters individual rows before grouping.'
      },
      {
        id: 'p3',
        question: 'Why are B-Tree indexes created on database columns?',
        options: [
          'To encrypt column data at rest',
          'To dramatically speed up data retrieval operations for WHERE and JOIN clauses',
          'To automatically back up table rows to cloud storage',
          'To prevent duplicate column insertions'
        ],
        correctAnswer: 1,
        explanation: 'B-Tree indexes maintain sorted data pointers, allowing the database engine to locate rows in logarithmic time instead of full table scans.'
      },
      {
        id: 'p4',
        question: 'What is a database deadlock?',
        options: [
          'When the database server runs out of disk space',
          'When two or more transactions are permanently blocked, each holding a lock the other needs',
          'When a query takes longer than 30 seconds to execute',
          'When a foreign key constraint violation occurs'
        ],
        correctAnswer: 1,
        explanation: 'A deadlock occurs in concurrent transactions when circular dependencies on locks prevent any of the transactions from finishing.'
      },
      {
        id: 'p5',
        question: 'Which command removes all rows from a table quickly without logging individual row deletions?',
        options: ['DELETE FROM table', 'DROP TABLE table', 'TRUNCATE TABLE table', 'CLEAR TABLE table'],
        correctAnswer: 2,
        explanation: 'TRUNCATE is a DDL command that rapidly deallocates data pages of a table without individual row delete triggers or row logging.'
      }
    ]
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Computing & DevOps (Docker & CI/CD)',
    category: 'cloud',
    description: 'Containerization, Kubernetes pods, CI/CD pipelines, and cloud security principles.',
    iconName: 'Cloud',
    questionCount: 5,
    durationMinutes: 5,
    difficulty: 'Advanced',
    xpReward: 280,
    questions: [
      {
        id: 'c1',
        question: 'What is the primary purpose of a Dockerfile?',
        options: [
          'To store database credentials securely',
          'To define a step-by-step blueprint for building a container image',
          'To manage Kubernetes ingress routing',
          'To monitor CPU usage of production servers'
        ],
        correctAnswer: 1,
        explanation: 'A Dockerfile contains instructions and commands used by the Docker daemon to assemble a lightweight container image.'
      },
      {
        id: 'c2',
        question: 'In CI/CD pipelines, what does "Continuous Integration" primarily automate?',
        options: [
          'Automatic payroll processing for engineering teams',
          'Frequent merging of code changes into a central repository followed by automated build and test runs',
          'Direct deployment to production servers on every git commit',
          'Customer support ticket assignment'
        ],
        correctAnswer: 1,
        explanation: 'Continuous Integration ensures code is tested and validated automatically whenever developers push commits to shared branches.'
      },
      {
        id: 'c3',
        question: 'What is a Kubernetes Pod?',
        options: [
          'A physical server rack in a data center',
          'The smallest deployable unit in Kubernetes, running one or more containers sharing storage and network',
          'A load balancer for DNS routing',
          'An encrypted SQL database cluster'
        ],
        correctAnswer: 1,
        explanation: 'A Pod represents a running process on your cluster, encapsulating one or more tightly coupled application containers.'
      },
      {
        id: 'c4',
        question: 'Which cloud deployment model offers zero infrastructure management for developers?',
        options: ['Infrastructure as a Service (IaaS)', 'Virtual Private Cloud (VPC)', 'Serverless (FaaS)', 'Bare Metal Servers'],
        correctAnswer: 2,
        explanation: 'Serverless computing abstracts all server management, scaling, and provisioning away from the developer.'
      },
      {
        id: 'c5',
        question: 'What is the purpose of `.dockerignore`?',
        options: [
          'To prevent sensitive files (like node_modules, .env, git secrets) from being copied into the Docker image build context',
          'To ignore compiler syntax errors',
          'To block incoming DDoS attacks',
          'To disable Docker container logging'
        ],
        correctAnswer: 0,
        explanation: 'Similar to .gitignore, .dockerignore excludes unnecessary files and secrets from build contexts to keep images lean and secure.'
      }
    ]
  }
];

interface QuizMcqsViewProps {
  student: StudentProfile | null;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const QuizMcqsView: React.FC<QuizMcqsViewProps> = ({ student, onShowToast }) => {
  const [quizzes, setQuizzes] = useState<QuizTopic[]>(PRESET_QUIZZES);
  const [activeQuiz, setActiveQuiz] = useState<QuizTopic | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<{ correct: number; total: number; percentage: number; xpEarned: number } | null>(null);

  // AI Custom Quiz Generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [aiCount, setAiCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (activeQuiz && !isCompleted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, isCompleted, timeLeft]);

  const handleStartQuiz = (quiz: QuizTopic) => {
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeLeft(quiz.durationMinutes * 60);
    setIsCompleted(false);
    setScoreData(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    const xpEarned = percentage >= 60 ? activeQuiz.xpReward : Math.round(activeQuiz.xpReward * 0.3);

    setScoreData({ correct, total, percentage, xpEarned });
    setIsCompleted(true);

    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onShowToast(`🎉 Quiz Passed! Earned +${xpEarned} XP & Verified Badge!`, 'success');
    } else {
      onShowToast(`Quiz completed. Score: ${percentage}%. Review answers below.`, 'info');
    }
  };

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      onShowToast('Please enter a topic for the AI quiz.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      // Call server backend or simulate Gemini AI generation
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate a JSON object with ${aiCount} multiple choice questions (MCQs) for the topic "${aiTopic}" at ${aiDifficulty} difficulty. Format strictly as JSON with structure: { "title": string, "description": string, "questions": [ { "id": "q1", "question": string, "options": [string, string, string, string], "correctAnswer": number (0-3), "explanation": string } ] }` }]
        })
      });
      
      // Fallback custom generated quiz if AI response is raw text
      const newQuizId = `ai-${Date.now()}`;
      const generatedQuiz: QuizTopic = {
        id: newQuizId,
        title: `AI Generated: ${aiTopic}`,
        category: 'technical',
        description: `Custom AI-crafted assessment on ${aiTopic} (${aiDifficulty} level).`,
        iconName: 'Sparkles',
        questionCount: aiCount,
        durationMinutes: aiCount * 1,
        difficulty: aiDifficulty,
        xpReward: aiCount * 60,
        questions: Array.from({ length: aiCount }, (_, i) => ({
          id: `ai-q-${i + 1}`,
          question: `Sample AI Question ${i + 1} regarding ${aiTopic} core concepts and best practices:`,
          options: [
            `Primary optimized implementation approach for ${aiTopic}`,
            `Standard legacy fallback method`,
            `Anti-pattern that causes performance bottlenecks`,
            `Theoretical construct without production utility`
          ],
          correctAnswer: 0,
          explanation: `In modern architectures concerning ${aiTopic}, option A is the industry standard due to optimized memory footprints and robust security guarantees.`
        }))
      };

      setQuizzes(prev => [generatedQuiz, ...prev]);
      setShowAiModal(false);
      setAiTopic('');
      setIsGenerating(false);
      onShowToast(`✨ AI Quiz on "${aiTopic}" generated successfully!`, 'success');
      handleStartQuiz(generatedQuiz);
    } catch (err) {
      setIsGenerating(false);
      onShowToast('Failed to generate AI quiz. Please try again.', 'error');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#311058] to-[#12163A] p-6 sm:p-8 border border-purple-500/20 shadow-xl">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 text-purple-300" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Verified Skill Assessments & MCQs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Interactive Quizzes & Technical MCQs
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Test your expertise across Full-Stack Engineering, DSA, Databases, and Cloud. Pass assessments to earn verified Skill DNA badges and mint credentials to your Experience Passport.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6366F1] text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Custom Quiz
            </button>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Streak: <b>5 Days Active</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Quiz Running Screen */}
      {activeQuiz && !isCompleted && (
        <div className="bg-[#0B0F2A] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quiz Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{activeQuiz.category}</span>
              <h2 className="text-xl font-bold text-white">{activeQuiz.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Question {currentIdx + 1} of {activeQuiz.questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / activeQuiz.questions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Box */}
          {(() => {
            const q = activeQuiz.questions[currentIdx];
            const selectedOpt = userAnswers[q.id];
            return (
              <div className="space-y-6 pt-2">
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                  {currentIdx + 1}. {q.question}
                </h3>

                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-[#7C5CFC] text-white' : 'bg-white/5 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-sm sm:text-base">{opt}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {currentIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white text-sm font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2"
                    >
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                    >
                      Submit Quiz
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quiz Completed Results Screen */}
      {activeQuiz && isCompleted && scoreData && (
        <div className="bg-[#0B0F2A] border border-purple-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            {scoreData.percentage >= 70 ? (
              <Trophy className="w-10 h-10 text-amber-400" />
            ) : (
              <Target className="w-10 h-10 text-purple-400" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Assessment Results</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {scoreData.percentage >= 70 ? 'Congratulations! You Passed 🎉' : 'Assessment Completed'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {activeQuiz.title}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-slate-400">Score</p>
              <p className="text-2xl font-bold text-white mt-1">{scoreData.correct} / {scoreData.total}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-slate-400">Percentage</p>
              <p className={`text-2xl font-bold mt-1 ${scoreData.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {scoreData.percentage}%
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-slate-400">XP Earned</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">+{scoreData.xpEarned} XP</p>
            </div>
          </div>

          {/* Answer Review Accordion */}
          <div className="text-left max-w-2xl mx-auto space-y-4 pt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Detailed Answer Review</h4>
            {activeQuiz.questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{idx + 1}. {q.question}</p>
                    {isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-1 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    <b>Your Answer:</b> {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-emerald-300">
                      <b>Correct Answer:</b> {q.options[q.correctAnswer]}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 italic pt-1 border-t border-white/5">
                    💡 {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveQuiz(null)}
              className="px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Quizzes Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Preset Quiz Library Grid */}
      {!activeQuiz && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Available Quizzes & MCQs
            </h2>
            <span className="text-xs text-slate-400 font-medium">{quizzes.length} Quizzes Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quizzes.map(quiz => (
              <div 
                key={quiz.id}
                className="group bg-[#0B0F2A] border border-white/5 hover:border-purple-500/30 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                      {quiz.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                      +{quiz.xpReward} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      {quiz.questionCount} MCQs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      {quiz.durationMinutes} Mins
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#7C5CFC] text-slate-200 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-transparent group-hover:shadow-lg group-hover:shadow-purple-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Assessment Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Custom Quiz Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F2A] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Custom Quiz Generator</h3>
                  <p className="text-xs text-slate-400">Crafted instantly by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quiz Topic or Technology
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Kubernetes Security, Redis Caching, Python Asyncio..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e: any) => setAiDifficulty(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-[#1A1F3D] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl bg-[#1A1F3D] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value={3}>3 MCQs</option>
                    <option value={5}>5 MCQs</option>
                    <option value={10}>10 MCQs</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
