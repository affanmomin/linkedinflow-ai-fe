import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingPaths } from "@/components/ui/floating-paths";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
} from "lucide-react";

export function Hero() {
  const titleRows = [
    ["Your LinkedIn,"],
    ["Finally"],
    ["On Autopilot"],
  ];

  return (
    <section className="pt-32 pb-24 px-4 overflow-hidden relative bg-[#eef3f8]">
      {/* Background Paths Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Animated Spotlights - Aceternity Style */}
      <motion.div
        className="absolute left-1/4 top-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10,102,194,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.3, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-1/3 top-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10,102,194,0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 100, -50, 0],
          scale: [1.2, 1, 1.3, 1.2]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute -left-20 bottom-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10,102,194,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 50, -100, 0],
          y: [0, -60, 80, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-16">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.045em] mb-6 leading-[1.08] px-2"
            style={{ fontFamily: "'Orbitron', system-ui, -apple-system, 'Segoe UI', sans-serif", fontWeight: 500, letterSpacing: '-0.045em', fontVariationSettings: "'wght' 500" }}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { delayChildren: 0.12, staggerChildren: 0.12 },
              },
            }}
          >
            {titleRows.map((row, rowIndex) => (
              <div key={row.join("-")} className="overflow-visible py-1">
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-x-2 md:gap-x-3"
                  variants={{
                    hidden: { y: "120%", opacity: 0 },
                    show: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.72,
                        ease: [0.22, 1, 0.36, 1],
                        delay: rowIndex * 0.06,
                      },
                    },
                  }}
                >
                  {row.map((word) => {
                    const isHighlight = rowIndex === 1;
                    return (
                      <motion.span key={word} className="inline-block">
                        <span
                          className={
                            isHighlight
                              ? "bg-gradient-to-b from-[#55b6ff] via-[#1f86f3] to-[#0a66c2] bg-clip-text text-transparent"
                              : "bg-gradient-to-b from-[#2f3746] via-[#3a4352] to-[#596273] bg-clip-text text-transparent"
                          }
                        >
                          {word}
                        </span>
                      </motion.span>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </motion.h1>

          <motion.div
            className="mx-auto mb-6 h-px w-28 bg-linear-to-r from-transparent via-[#0a66c2] to-transparent"
            initial={{ opacity: 0, scaleX: 0.35 }}
            animate={{ opacity: [0.35, 0.75, 0.35], scaleX: [0.35, 1, 0.35] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
          />

          <motion.p
            className="text-xl text-[#595959] mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            LinkedInFlow turns your weekly wins, lessons, and thoughts into polished
            LinkedIn posts — so B2B founders build real inbound in 30 minutes a week.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base bg-[#0a66c2] text-white hover:bg-[#004182] border-0
                           font-semibold shadow-[0_4px_20px_rgba(10,102,194,0.30)] hover:shadow-[0_4px_28px_rgba(10,102,194,0.45)]
                           transition-all duration-200"
              >
                Start Growing Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base border-2 border-[#0a66c2] text-[#0a66c2] bg-white
                           hover:bg-[#0a66c2]/10 hover:border-[#0a66c2] transition-all duration-200 font-semibold"
              >
                <Play className="mr-2 w-4 h-4" /> Watch 2-Min Demo
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
