import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Code, 
  Sparkles, 
  AlertCircle,
  Check,
  ChevronRight,
  BookOpen,
  Filter,
  BarChart2,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssessmentCategory, AssessmentQuestion, AssessmentResult, StudentProfile } from '../types';
import { 
  getAssessmentCategories, 
  getAssessmentResults, 
  recordAssessmentSubmission 
} from '../services/studentCareerService';

interface SkillAssessmentViewProps {
  student: StudentProfile | null;
  onNavigateTab: (tab: string) => void;
  onSkillUpdated?: () => void;
}

export const SkillAssessmentView: React.FC<SkillAssessmentViewProps> = ({
  student,
  onNavigateTab,
  onSkillUpdated
}) => {
  const categories = getAssessmentCategories();
  const [selectedType, setSelectedType] = useState<'all' | 'technical' | 'soft' | 'aptitude'>('all');
  
  // Assessment state
  const [activeCategory, setActiveCategory] = useState<AssessmentCategory | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [questionId: string]: boolean }>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null);
  
  // History state
  const [history, setHistory] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    setHistory(getAssessmentResults());
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: any;
    if (activeCategory && !isCompleted && timeRemainingSeconds > 0) {
      timer = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCategory, isCompleted, timeRemainingSeconds]);

  const handleStartAssessment = (category: AssessmentCategory) => {
    setActiveCategory(category);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeRemainingSeconds(category.durationMinutes * 60);
    setIsCompleted(false);
    setLastResult(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitAssessment = () => {
    if (!activeCategory) return;

    let correctCount = 0;
    const questions = activeCategory.questions;
    const answersBreakdown = questions.map(q => {
      const selected = userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        selectedOption: selected,
        correctOption: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= activeCategory.passingScore;
    const totalTimeSpent = (activeCategory.durationMinutes * 60) - timeRemainingSeconds;

    const result = recordAssessmentSubmission({
      assessmentId: activeCategory.id,
      assessmentTitle: activeCategory.title,
      category: activeCategory.subCategory,
      date: new Date().toISOString().split('T')[0],
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount,
      timeSpentSeconds: totalTimeSpent,
      passed,
      answers: answersBreakdown
    });

    setLastResult(result);
    setIsCompleted(true);
    setHistory(getAssessmentResults());

    if (passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }

    if (onSkillUpdated) {
      onSkillUpdated();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredCategories = categories.filter(c => {
    if (selectedType === 'all') return true;
    return c.type === selectedType;
  });

  // ==========================================
  // RENDER: RESULTS SCREEN
  // ==========================================
  if (activeCategory && isCompleted && lastResult) {
    return (
      <div id="assessment-result-screen" className="max-w-4xl mx-auto space-y-6">
        {/* Header summary banner */}
        <div className="bg-[#12162E] border border-white/10 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0B0F2A] border border-white/10 mb-4 shadow-xl">
            {lastResult.passed ? (
              <Award className="w-10 h-10 text-emerald-400" />
            ) : (
              <AlertCircle className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {lastResult.passed ? 'Skill Assessment Passed!' : 'Assessment Completed'}
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
            {lastResult.passed 
              ? `Congratulations! Your score in ${lastResult.assessmentTitle} has been verified and updated in your Skill DNA.` 
              : `Review the technical solutions below to target your gaps and retake the assessment when ready.`}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6">
            <div className="bg-[#0B0F2A] border border-white/10 rounded-xl p-4 text-center">
              <span className="text-xs text-white/50 block font-medium">Final Score</span>
              <span className={`text-2xl font-bold ${lastResult.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {lastResult.score}%
              </span>
            </div>
            <div className="bg-[#0B0F2A] border border-white/10 rounded-xl p-4 text-center">
              <span className="text-xs text-white/50 block font-medium">Accuracy</span>
              <span className="text-2xl font-bold text-white">
                {lastResult.correctAnswers}/{lastResult.totalQuestions}
              </span>
            </div>
            <div className="bg-[#0B0F2A] border border-white/10 rounded-xl p-4 text-center">
              <span className="text-xs text-white/50 block font-medium">Time Taken</span>
              <span className="text-2xl font-bold text-cyan-400">
                {Math.round(lastResult.timeSpentSeconds / 60)}m {lastResult.timeSpentSeconds % 60}s
              </span>
            </div>
            <div className="bg-[#0B0F2A] border border-white/10 rounded-xl p-4 text-center">
              <span className="text-xs text-white/50 block font-medium">Status</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${
                lastResult.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {lastResult.passed ? 'VERIFIED ✓' : 'NEEDS PRACTICE'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="retake-assessment-btn"
              onClick={() => handleStartAssessment(activeCategory)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </button>
            <button
              id="view-skill-gap-btn"
              onClick={() => onNavigateTab('gap-analysis')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] text-white font-semibold text-sm shadow-lg shadow-[#7C5CFC]/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              View Updated Skill Gaps
            </button>
            <button
              id="back-to-hub-btn"
              onClick={() => setActiveCategory(null)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white font-semibold text-sm transition-all"
            >
              Back to Assessments
            </button>
          </div>
        </div>

        {/* Question by Question Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8B7CF8]" />
            Detailed Question Review & Explanations
          </h3>

          {lastResult.answers.map((ans, idx) => (
            <div 
              key={ans.questionId}
              className={`bg-[#12162E] border rounded-xl p-5 ${
                ans.isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Question {idx + 1}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  ans.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {ans.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <p className="text-white font-medium text-sm sm:text-base mb-3">
                {ans.question}
              </p>

              <div className="bg-[#0B0F2A] border border-white/5 rounded-lg p-3 text-xs space-y-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/40">Your Answer:</span>
                  <span className={ans.isCorrect ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {ans.selectedOption >= 0 ? `Option ${ans.selectedOption + 1}` : 'Not Answered'}
                  </span>
                </div>
                {!ans.isCorrect && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">Correct Answer:</span>
                    <span className="text-emerald-400 font-semibold">
                      Option {ans.correctOption + 1}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-[#1A1F3D]/60 border border-[#7C5CFC]/20 rounded-lg p-3 text-xs text-white/80">
                <span className="text-[#8B7CF8] font-semibold block mb-1">💡 Technical Explanation:</span>
                {ans.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE ASSESSMENT TAKING MODE
  // ==========================================
  if (activeCategory && !isCompleted) {
    const question = activeCategory.questions[currentQuestionIdx];
    const totalQuestions = activeCategory.questions.length;
    const selectedOption = userAnswers[question.id];
    const isFlagged = flaggedQuestions[question.id];
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div id="active-assessment-container" className="max-w-4xl mx-auto space-y-6">
        {/* Top Sticky Header */}
        <div className="bg-[#12162E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#8B7CF8] uppercase tracking-wider">
              {activeCategory.subCategory} Assessment
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {activeCategory.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              timeRemainingSeconds < 120 
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
                : 'bg-[#0B0F2A] border-white/10 text-cyan-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-sm">
                {formatTime(timeRemainingSeconds)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="submit-assessment-btn"
              onClick={handleSubmitAssessment}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
            >
              Submit ({answeredCount}/{totalQuestions})
            </button>
          </div>
        </div>

        {/* Question Progress & Palette */}
        <div className="bg-[#12162E] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Question {currentQuestionIdx + 1} of {totalQuestions}</span>
            <span>Progress: {Math.round((answeredCount / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-[#0B0F2A] h-1.5 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Palette buttons */}
          <div className="flex flex-wrap gap-2">
            {activeCategory.questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIdx;
              const hasFlag = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all relative ${
                    isCurrent 
                      ? 'bg-[#7C5CFC] text-white ring-2 ring-[#00D9FF]' 
                      : isAnswered 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#0B0F2A] text-white/50 border border-white/10 hover:text-white'
                  }`}
                >
                  {idx + 1}
                  {hasFlag && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Card */}
        <div className="bg-[#12162E] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              Difficulty: {question.difficulty}
            </span>
            <button
              onClick={() => handleToggleFlag(question.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg border transition-all ${
                isFlagged 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-transparent text-white/50 border-white/10 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {isFlagged ? 'Flagged for Review' : 'Flag Question'}
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {question.question}
          </h3>

          {/* Optional Code Snippet */}
          {question.codeSnippet && (
            <div className="bg-[#0B0F2A] border border-white/10 rounded-xl p-4 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm text-cyan-300">
                <code>{question.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Multi-choice options */}
          <div className="space-y-3">
            {question.options.map((optionText, optIdx) => {
              const isSelected = selectedOption === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(question.id, optIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/10'
                      : 'bg-[#0B0F2A] border-white/5 text-white/80 hover:bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border shrink-0 ${
                      isSelected 
                        ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]' 
                        : 'bg-white/5 text-white/50 border-white/10'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm font-medium">{optionText}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#7C5CFC]/20"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ASSESSMENT CATALOG & HISTORY
  // ==========================================
  return (
    <div id="skill-assessment-page" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12162E] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 text-[#8B7CF8] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            STANDARDIZED ASSESSMENT ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Skill Assessment Center
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Validate your technical proficiency, problem-solving speed, and soft skills with industry-calibrated assessments. Passing an assessment mints cryptographic verification directly to your Experience Passport and updates your placement match score.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mt-6">
          {(['all', 'technical', 'soft', 'aptitude'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedType === tab
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] text-white shadow-md'
                  : 'bg-[#0B0F2A] border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Assessments' : `${tab} Skills`}
            </button>
          ))}
        </div>
      </div>

      {/* Available Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(cat => {
          const pastResults = history.filter(h => h.assessmentId === cat.id);
          const bestScore = pastResults.length > 0 ? Math.max(...pastResults.map(r => r.score)) : null;

          return (
            <div
              key={cat.id}
              className="bg-[#12162E] border border-white/10 rounded-2xl p-5 hover:border-[#7C5CFC]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#8B7CF8]">
                    {cat.subCategory}
                  </span>
                  <span className="text-xs text-white/50 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {cat.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {cat.title}
                </h3>
                <p className="text-white/60 text-xs line-clamp-3 mb-4 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Questions: {cat.questionCount}</span>
                  <span className="text-white/40">Pass Score: {cat.passingScore}%</span>
                </div>

                {bestScore !== null && (
                  <div className="bg-[#0B0F2A] border border-white/5 rounded-lg p-2 flex items-center justify-between text-xs">
                    <span className="text-white/60">Best Verified Score:</span>
                    <span className={`font-bold ${bestScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {bestScore}% {bestScore >= 70 ? '✓' : ''}
                    </span>
                  </div>
                )}

                <button
                  id={`start-assessment-${cat.id}`}
                  onClick={() => handleStartAssessment(cat)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#00D9FF] hover:opacity-90 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Award className="w-4 h-4" />
                  {bestScore !== null ? 'Retake Assessment' : 'Start Assessment'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assessment History Table */}
      {history.length > 0 && (
        <div className="bg-[#12162E] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#8B7CF8]" />
              Your Assessment Verification History
            </h3>
            <span className="text-xs text-white/50 font-medium">
              {history.length} Completed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Assessment</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Time Spent</th>
                  <th className="pb-3 font-semibold">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map(item => (
                  <tr key={item.id} className="text-white/80 hover:bg-white/[0.02]">
                    <td className="py-3 font-medium text-white">{item.assessmentTitle}</td>
                    <td className="py-3 text-white/60">{item.category}</td>
                    <td className="py-3 text-white/50">{item.date}</td>
                    <td className="py-3">
                      <span className={`font-bold ${item.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.score}%
                      </span>
                    </td>
                    <td className="py-3 text-white/50">
                      {Math.round(item.timeSpentSeconds / 60)}m {item.timeSpentSeconds % 60}s
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                        item.passed 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.passed ? 'Verified ✓' : 'Practice'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
