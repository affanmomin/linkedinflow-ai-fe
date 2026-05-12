import { motion } from "framer-motion";
import { Github, Star, GitFork } from "lucide-react";
import { useEffect, useState } from "react";

interface RepoData {
  stargazers_count: number;
  forks_count: number;
  description: string;
  url: string;
  language: string;
}

export function RepoShowcase({ owner, repo }: { owner: string; repo: string }) {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const data = await res.json();
        setRepoData({
          stargazers_count: data.stargazers_count || 0,
          forks_count: data.forks_count || 0,
          description: data.description || "A powerful SaaS application",
          url: data.html_url,
          language: data.language || "TypeScript",
        });
      } catch (error) {
        console.error("Failed to fetch repo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [owner, repo]);

  return (
    <motion.a
      href={`https://github.com/${owner}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ y: -4 }}
      className="inline-block w-full max-w-md group"
    >
      <div className="relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="rounded-[1.15rem] px-6 py-5 backdrop-blur-md bg-white/95 hover:bg-white/100 dark:bg-slate-900/95 dark:hover:bg-slate-900/100 border border-black/10 dark:border-white/10 flex flex-col gap-4">

          {/* Header with GitHub icon and stars */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                <Github className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {repo.replace(/-/g, " ")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {owner}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {repoData && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
              {repoData.description}
            </p>
          )}

          {/* Footer with stats */}
          {!loading && repoData && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {repoData.stargazers_count > 0
                    ? repoData.stargazers_count.toLocaleString()
                    : "0"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {repoData.forks_count > 0
                    ? repoData.forks_count.toLocaleString()
                    : "0"}
                </span>
              </div>
              {repoData.language && (
                <div className="ml-auto">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {repoData.language}
                  </span>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="h-3 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}
