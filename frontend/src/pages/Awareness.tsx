import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, HelpCircle, Award, CheckCircle, XCircle, AlertCircle, Play, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  publishedAt: string;
}

export const Awareness: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
    badgeEarned: string | null;
    message: string;
  } | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/awareness/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleQuizAnswer = (qKey: string, answer: string) => {
    setQuizAnswers({ ...quizAnswers, [qKey]: answer });
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setQuizError('You must be logged in to submit a quiz and earn badges.');
      return;
    }
    
    // Check if all 5 questions are answered
    if (Object.keys(quizAnswers).length < 5) {
      setQuizError('Please answer all 5 questions before submitting.');
      return;
    }

    setQuizError(null);
    try {
      const res = await api.post('/awareness/quizzes/submit', { answers: quizAnswers });
      setQuizResult(res.data);
      setQuizSubmitted(true);
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      setQuizError('Quiz submission failed. Please try again.');
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizSubmitted(false);
    setQuizError(null);
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: '1. What is the minimum weight requirement to donate blood safely in India?',
      options: [
        { label: '35 kg', value: '35kg' },
        { label: '45 kg', value: '45kg' },
        { label: '60 kg', value: '60kg' },
      ],
    },
    {
      id: 'q2',
      question: '2. How long must a male donor wait between whole blood donations?',
      options: [
        { label: '30 days', value: '30days' },
        { label: '60 days', value: '60days' },
        { label: '90 days (3 months)', value: '90days' },
      ],
    },
    {
      id: 'q3',
      question: '3. Can you contract infectious diseases like HIV from donating blood?',
      options: [
        { label: 'Yes, if the donor has a weak immune system.', value: 'yes' },
        { label: 'No, because brand-new, sterile, single-use needles are used.', value: 'no' },
        { label: 'Yes, if the donation center is crowded.', value: 'maybe' },
      ],
    },
    {
      id: 'q4',
      question: '4. What is the primary function of red blood cells (RBCs)?',
      options: [
        { label: 'To carry oxygen throughout the body', value: 'oxygen' },
        { label: 'To fight virus infections', value: 'infections' },
        { label: 'To clot wounds', value: 'clotting' },
      ],
    },
    {
      id: 'q5',
      question: '5. Which blood group is referred to as the "Universal Donor"?',
      options: [
        { label: 'AB positive (AB+)', value: 'abpositive' },
        { label: 'O positive (O+)', value: 'opositive' },
        { label: 'O negative (O-)', value: 'onegative' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Awareness Hub</h1>
        <p className="text-slate-500 text-sm">
          Educate yourself through scientific articles, take safety quizzes to earn voluntary badges, and read donor success stories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Articles list / View Article */}
        <div className="lg:col-span-2 space-y-6">
          {selectedArticle ? (
            /* View Article Details */
            <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm space-y-6 slide-up">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                &larr; Back to Articles
              </button>

              {selectedArticle.image && (
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-xl shadow-inner border border-slate-100"
                />
              )}

              <div className="space-y-3">
                <span className="bg-red-50 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded border border-red-100 uppercase">
                  {selectedArticle.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedArticle.title}</h2>
                <p className="text-[10px] text-slate-400">
                  Published: {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Render content markdown-like (line breaks to p tags) */}
              <div className="text-xs text-slate-600 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
                {selectedArticle.content}
              </div>
            </div>
          ) : (
            /* Articles List */
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Featured Learning Modules
              </h2>

              {loading ? (
                <div className="bg-white border border-slate-100 rounded-card p-12 text-center shadow-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">Loading articles...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-card p-8 text-center text-xs text-slate-400">
                  No awareness articles uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white border border-slate-100 hover:border-slate-200 rounded-card overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedArticle(art)}
                    >
                      {art.image && (
                        <img
                          src={art.image}
                          alt={art.title}
                          className="h-40 w-full object-cover border-b border-slate-50"
                        />
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="bg-red-50 text-primary text-[9px] font-bold px-2 py-0.5 rounded border border-red-100">
                            {art.category}
                          </span>
                          <h3 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">
                            {art.title}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                          <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                          <span className="text-primary font-bold hover:underline">Read Article &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Quiz Console */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm self-start space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Awareness Challenge</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Test your safety knowledge and earn the Champion badge.</p>
            </div>
          </div>

          {/* Quiz Panel */}
          {quizSubmitted && quizResult ? (
            /* Results Panel */
            <div className="space-y-5 text-center py-4 slide-up">
              {quizResult.passed ? (
                <>
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <Award className="h-10 w-10 fill-current animate-bounce" />
                  </div>
                  <h4 className="font-bold text-emerald-800 text-sm">Perfect Score! 5/5</h4>
                  <p className="text-xs text-slate-600 leading-relaxed px-2">
                    Congratulations! You answered all questions correctly and unlocked the **Awareness Champion Badge**. It has been added to your profile profile achievements!
                  </p>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-red-100 text-primary rounded-full flex items-center justify-center mx-auto border border-red-200">
                    <XCircle className="h-10 w-10" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Score: {quizResult.score}/5</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You need a perfect 5/5 score to earn the badge. Read the guidelines and try again!
                  </p>
                </>
              )}

              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-card text-xs font-semibold transition-colors"
              >
                {quizResult.passed ? 'Retake Quiz' : 'Try Again'}
              </button>
            </div>
          ) : (
            /* Questions Console */
            <form onSubmit={handleQuizSubmit} className="space-y-5 text-xs">
              {quizError && (
                <div className="bg-red-50 border border-red-100 text-primary p-2.5 rounded-card flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-[10px]">{quizError}</span>
                </div>
              )}

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {quizQuestions.map((q) => (
                  <div key={q.id} className="space-y-2 border-b border-slate-50 pb-3">
                    <p className="font-bold text-slate-800 leading-snug">{q.question}</p>
                    <div className="space-y-1.5 pl-1.5">
                      {q.options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={quizAnswers[q.id] === opt.value}
                            onChange={() => handleQuizAnswer(q.id, opt.value)}
                            className="h-3.5 w-3.5 text-primary focus:ring-primary/20 border-slate-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!user ? (
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-card text-[10px] text-slate-400 text-center font-normal">
                  Please login to take the quiz and unlock badges.
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-card font-bold transition-all shadow shadow-primary/15"
                >
                  Submit Quiz Answers
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
