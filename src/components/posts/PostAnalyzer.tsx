import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Loader,
} from 'lucide-react';
import { postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PostAnalysis {
  performanceScore: {
    score: number;
    predictedLikes: number;
    predictedComments: number;
    breakdown: Record<string, number>;
  };
  optimalTime: {
    recommendedHour: number;
    recommendedDay: string;
    engagementLiftPercent: number;
    engagementPrediction: {
      ifPostedNow: number;
      ifPostedOptimal: number;
      potentialGain: number;
    };
  };
  suggestions: Array<{
    type: string;
    current?: string | number;
    suggested?: string | number;
    impact: string;
    reason: string;
  }>;
  abtestOptions: Array<{
    title: string;
    content: string;
    predictedScore: number;
  }>;
}

interface PostAnalyzerProps {
  content: string;
  postType?: 'text' | 'image' | 'video' | 'link';
  onTimeSelected?: (hour: number, day: string) => void;
}

export function PostAnalyzer({
  content,
  postType = 'text',
  onTimeSelected
}: PostAnalyzerProps) {
  const [analysis, setAnalysis] = useState<PostAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Debounced analysis on content change
  useEffect(() => {
    if (!content || content.length < 10) {
      setAnalysis(null);
      setAnalyzeError(null);
      return;
    }

    const timer = setTimeout(() => {
      analyzePost();
    }, 1500); // Debounce 1.5s

    return () => clearTimeout(timer);
  }, [content, postType]);

  const analyzePost = useCallback(async () => {
    try {
      setIsLoading(true);
      setAnalyzeError(null);

      const result = await postsAPI.analyzePost({
        content,
        post_type: postType,
      });

      if (result && result.performanceScore) {
        setAnalysis(result);
      } else {
        setAnalyzeError('Failed to analyze post');
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);

      // Better error messages
      if (error?.response?.status === 404) {
        setAnalyzeError('Analysis feature is being set up. Check back soon!');
      } else if (error?.response?.status === 401) {
        setAnalyzeError('Please sign in to use post analysis');
      } else if (error?.code === 'ECONNREFUSED') {
        setAnalyzeError('Backend service not available');
      } else {
        setAnalyzeError('Unable to analyze post at this time');
      }
    } finally {
      setIsLoading(false);
    }
  }, [content, postType]);

  if (!analysis && !isLoading && !analyzeError) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {analyzeError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <p className="font-medium mb-1">📊 {analyzeError}</p>
          <p className="text-xs text-amber-600">
            The backend analysis service is still being set up. You can still create posts normally.
          </p>
        </div>
      )}

      {isLoading && !analysis && (
        <div className="flex items-center justify-center p-6 rounded-lg border border-blue-200 bg-blue-50">
          <Loader className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-700 font-medium">Analyzing your post...</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {analysis && (
          <>
            {/* Performance Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      Performance Score
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4 mb-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="text-3xl font-bold text-blue-700"
                    >
                      {analysis.performanceScore.score.toFixed(1)}
                    </motion.div>
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900">
                        {analysis.performanceScore.predictedLikes} likes
                      </p>
                      <p className="text-xs text-blue-600">
                        {analysis.performanceScore.predictedComments} comments
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analysis.performanceScore.breakdown || {})
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col p-2 rounded bg-white/70 border border-blue-100"
                        >
                          <span className="text-[11px] text-blue-600 capitalize font-medium">
                            {key}
                          </span>
                          <span className="font-bold text-blue-900">
                            {(value as number).toFixed(1)}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Optimal Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-green-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-3 text-sm">
                    Best Time to Post
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg bg-white/70 border border-green-200 p-3"
                    >
                      <p className="text-xs text-green-700 font-medium mb-1">Recommended Time</p>
                      <p className="text-lg font-bold text-green-900">
                        {String(analysis.optimalTime.recommendedHour).padStart(2, '0')}:00
                      </p>
                      <p className="text-xs text-green-700 font-medium mt-1">
                        {analysis.optimalTime.recommendedDay}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg bg-white/70 border border-green-200 p-3"
                    >
                      <p className="text-xs text-green-700 font-medium mb-1">Engagement Boost</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{analysis.optimalTime.engagementLiftPercent}%
                      </p>
                      <p className="text-xs text-green-700 font-medium mt-1">vs. average</p>
                    </motion.div>
                  </div>

                  {onTimeSelected && (
                    <button
                      onClick={() => {
                        onTimeSelected(
                          analysis.optimalTime.recommendedHour,
                          analysis.optimalTime.recommendedDay
                        );
                        toast.success('Scheduled for optimal time');
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      Schedule at Optimal Time
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Suggestions - Collapsible */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                    showSuggestions
                      ? 'border-amber-300 bg-amber-100/60'
                      : 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:bg-amber-100/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-900 text-sm">Quick Improvements</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-700">
                    {analysis.suggestions.length} tips
                  </span>
                </button>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="space-y-2"
                    >
                      {analysis.suggestions.map((suggestion, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-white/70 border border-amber-200"
                        >
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-semibold text-amber-900 capitalize">{suggestion.type}</p>
                            <p className="text-amber-700 text-[12px]">{suggestion.reason}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* A/B Test Options - Collapsible */}
            {analysis.abtestOptions && analysis.abtestOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                    isExpanded
                      ? 'border-purple-300 bg-purple-100/60'
                      : 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:bg-purple-100/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-900 text-sm">A/B Test Variations</span>
                  </div>
                  <span className="text-xs font-semibold text-purple-700">
                    {analysis.abtestOptions.length} options
                  </span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="space-y-2"
                    >
                      {analysis.abtestOptions.map((option, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="p-3 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="font-semibold text-purple-900 text-sm">{option.title}</span>
                            <span className="text-xs font-bold text-purple-600 whitespace-nowrap">{option.predictedScore}/10</span>
                          </div>
                          <p className="text-xs text-purple-700 line-clamp-2">{option.content}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
