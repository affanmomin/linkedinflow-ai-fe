import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Window grid helper ────────────────────────────────────────────────────────

interface WindowGridProps {
  bx: number;
  by: number;
  bw: number;
  bh: number;
  cols: number;
  rows: number;
  baseOpacity?: number;
}

function WindowGrid({ bx, by, bw, bh, cols, rows, baseOpacity = 0.52 }: WindowGridProps) {
  const winW = 6;
  const winH = 8;
  const hGap = (bw - cols * winW) / (cols + 1);
  const vGap = (bh - rows * winH) / (rows + 1);

  const items = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const isWarm = (r + c * 2) % 5 === 0;
      const isLit  = (r + c)     % 4 !== 3;
      return (
        <rect
          key={`w-${bx}-${r}-${c}`}
          x={bx + hGap + c * (winW + hGap)}
          y={by + vGap + r * (winH + vGap)}
          width={winW}
          height={winH}
          fill={isWarm ? '#fff8cc' : 'white'}
          opacity={isLit ? (isWarm ? 0.78 : baseOpacity) : 0.12}
          rx="0.5"
        />
      );
    })
  ).flat();

  return <>{items}</>;
}

// ── City illustration ─────────────────────────────────────────────────────────

function CityIllustration() {
  return (
    <svg
      viewBox="0 0 390 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="li-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c3dcf4" />
          <stop offset="65%"  stopColor="#aecde8" />
          <stop offset="100%" stopColor="#97bade" />
        </linearGradient>
        <linearGradient id="li-bA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#b6d1eb" />
          <stop offset="100%" stopColor="#8db4d4" />
        </linearGradient>
        <linearGradient id="li-bB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9dc3e3" />
          <stop offset="100%" stopColor="#70a8cc" />
        </linearGradient>
        <linearGradient id="li-bC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c8dced" />
          <stop offset="100%" stopColor="#a2c1da" />
        </linearGradient>
        <linearGradient id="li-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#72acd0" />
          <stop offset="100%" stopColor="#5b96bb" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="390" height="400" fill="url(#li-sky)" />

      {/* Sun glow */}
      <ellipse cx="310" cy="35" rx="45" ry="45" fill="white" opacity="0.13" />
      <ellipse cx="310" cy="35" rx="28" ry="28" fill="white" opacity="0.18" />
      <ellipse cx="310" cy="35" rx="14" ry="14" fill="white" opacity="0.28" />

      {/* Cloud 1 */}
      <g opacity="0.70">
        <ellipse cx="70"  cy="76" rx="38" ry="18" fill="white" />
        <ellipse cx="96"  cy="65" rx="32" ry="21" fill="white" />
        <ellipse cx="46"  cy="73" rx="25" ry="16" fill="white" />
        <ellipse cx="118" cy="76" rx="20" ry="13" fill="white" />
      </g>

      {/* Cloud 2 */}
      <g opacity="0.58">
        <ellipse cx="262" cy="50" rx="36" ry="16" fill="white" />
        <ellipse cx="288" cy="41" rx="29" ry="19" fill="white" />
        <ellipse cx="242" cy="54" rx="23" ry="13" fill="white" />
      </g>

      {/* Cloud 3 (wispy) */}
      <g opacity="0.42">
        <ellipse cx="348" cy="98"  rx="26" ry="12" fill="white" />
        <ellipse cx="366" cy="91"  rx="19" ry="13" fill="white" />
        <ellipse cx="330" cy="102" rx="16" ry="9"  fill="white" />
      </g>

      {/* ── Back row of buildings ── */}
      {/* B-back-1 */}
      <rect x="12"  y="192" width="56" height="208" fill="url(#li-bC)" rx="1" />
      <WindowGrid bx={12}  by={192} bw={56} bh={208} cols={3} rows={9}  baseOpacity={0.48} />

      {/* B-back-2  (tallest, center-left) */}
      <rect x="96"  y="148" width="72" height="252" fill="url(#li-bA)" rx="1" />
      {/* Antenna */}
      <rect x="130" y="130" width="3"  height="20"  fill="#90bad8" />
      <rect x="127" y="128" width="9"  height="3"   fill="#90bad8" rx="1" />
      <WindowGrid bx={96}  by={148} bw={72} bh={252} cols={4} rows={11} baseOpacity={0.50} />

      {/* B-back-3 */}
      <rect x="206" y="168" width="76" height="232" fill="url(#li-bC)" rx="1" />
      {/* Small rooftop box */}
      <rect x="228" y="160" width="30" height="10"  fill="#a8c5de" rx="1" />
      <rect x="238" y="152" width="4"  height="10"  fill="#95b9d4" />
      <WindowGrid bx={206} by={168} bw={76} bh={232} cols={4} rows={10} baseOpacity={0.48} />

      {/* B-back-4 */}
      <rect x="318" y="202" width="62" height="198" fill="url(#li-bA)" rx="1" />
      <WindowGrid bx={318} by={202} bw={62} bh={198} cols={3} rows={8}  baseOpacity={0.48} />

      {/* ── Front row of buildings ── */}
      {/* B-front-1 (left edge) */}
      <rect x="0"   y="238" width="44" height="162" fill="url(#li-bB)" rx="1" />
      <WindowGrid bx={0}   by={238} bw={44} bh={162} cols={2} rows={7}  baseOpacity={0.55} />

      {/* B-front-2 */}
      <rect x="50"  y="208" width="56" height="192" fill="url(#li-bB)" rx="1" />
      <WindowGrid bx={50}  by={208} bw={56} bh={192} cols={3} rows={9}  baseOpacity={0.55} />

      {/* B-front-3 (short) */}
      <rect x="114" y="272" width="42" height="128" fill="url(#li-bA)" rx="1" />
      <WindowGrid bx={114} by={272} bw={42} bh={128} cols={2} rows={5}  baseOpacity={0.58} />

      {/* B-front-4 (center dominant) */}
      <rect x="162" y="192" width="62" height="208" fill="url(#li-bB)" rx="1" />
      {/* Stepped roof */}
      <rect x="172" y="182" width="42" height="12"  fill="#68a0c2" rx="1" />
      <rect x="182" y="174" width="22" height="10"  fill="#5c96ba" rx="1" />
      <WindowGrid bx={162} by={192} bw={62} bh={208} cols={3} rows={9}  baseOpacity={0.55} />

      {/* B-front-5 */}
      <rect x="230" y="222" width="54" height="178" fill="url(#li-bA)" rx="1" />
      <WindowGrid bx={230} by={222} bw={54} bh={178} cols={3} rows={7}  baseOpacity={0.56} />

      {/* B-front-6 */}
      <rect x="290" y="242" width="52" height="158" fill="url(#li-bB)" rx="1" />
      <WindowGrid bx={290} by={242} bw={52} bh={158} cols={3} rows={6}  baseOpacity={0.54} />

      {/* B-front-7 (far right) */}
      <rect x="348" y="258" width="42" height="142" fill="url(#li-bA)" rx="1" />
      <WindowGrid bx={348} by={258} bw={42} bh={142} cols={2} rows={6}  baseOpacity={0.54} />

      {/* Ground plane */}
      <rect x="0" y="388" width="390" height="12"  fill="url(#li-ground)" />
      <rect x="0" y="393" width="390" height="7"   fill="#4e88af" opacity="0.55" />
    </svg>
  );
}

// ── Brand mark ────────────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 flex-shrink-0" aria-hidden="true">
      <rect width="36" height="36" rx="8" fill="#0a66c2" />
      <circle cx="12" cy="13" r="3.4" fill="white" />
      <circle cx="24" cy="13" r="3.4" fill="white" />
      <circle cx="18" cy="24" r="3.4" fill="white" />
      <line x1="12" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="18" y1="13" x2="18" y2="24" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const { setUser }  = useAuthStore();
  const navigate     = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await authAPI.login(data.email, data.password);
      setUser(result.user);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinks = ['User Agreement', 'Privacy Policy', 'Cookie Policy', 'Help Center'];

  return (
    /* ── Page background ── */
    <div className="min-h-screen bg-[#d3e7f5] flex items-center justify-center p-4 sm:p-8">

      {/* ── Card ── */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* ── Left: illustration panel ── */}
        <div className="md:w-[42%] bg-[#deedf8] flex flex-col overflow-hidden">

          {/* Brand */}
          <div className="px-7 pt-7 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-[17px] font-bold text-[#0a66c2] tracking-tight select-none">
                LinkedInFlow
              </span>
            </div>
            <p className="mt-3 text-[13px] text-[#4a86b8] leading-relaxed max-w-[210px]">
              Grow your professional presence — effortlessly.
            </p>
          </div>

          {/* Illustration */}
          <div className="flex-1 min-h-[200px] overflow-hidden">
            <CityIllustration />
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="md:w-[58%] flex flex-col px-8 py-10 sm:px-12 sm:py-12">

          {/* Form body — vertically centred */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-[360px] mx-auto">

              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                Welcome back
              </h1>
              <p className="mt-1.5 mb-8 text-sm text-gray-500">
                Sign in to your LinkedInFlow account
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="li-email"
                    className="block text-[13px] font-semibold text-gray-700"
                  >
                    Email or Phone
                  </label>
                  <input
                    id="li-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className="
                      w-full h-11 px-3.5 rounded-md text-sm
                      bg-[#eaf3fb] border border-[#c2daf0]
                      text-gray-900 placeholder-[#93b5cc]
                      focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]
                      transition-colors
                    "
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="li-password"
                    className="block text-[13px] font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="li-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register('password')}
                      className="
                        w-full h-11 px-3.5 pr-11 rounded-md text-sm
                        bg-[#eaf3fb] border border-[#c2daf0]
                        text-gray-900 placeholder-[#93b5cc]
                        focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]
                        transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7aaac4] hover:text-[#0a66c2] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye    className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot password */}
                <div className="flex justify-end -mt-1">
                  <Link
                    to="#"
                    className="text-[13px] font-medium text-[#0a66c2] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      flex-1 h-11 rounded-full text-[14px] font-semibold
                      bg-[#0a66c2] text-white
                      hover:bg-[#004182] active:bg-[#003471]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-colors flex items-center justify-center gap-2
                    "
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in…
                      </>
                    ) : 'Login'}
                  </button>

                  <Link
                    to="/signup"
                    className="
                      flex-1 h-11 rounded-full text-[14px] font-semibold
                      border-2 border-[#0a66c2] text-[#0a66c2]
                      hover:bg-[#eaf3fb] active:bg-[#daeaf8]
                      transition-colors flex items-center justify-center
                    "
                  >
                    Sign up
                  </Link>
                </div>

              </form>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {footerLinks.map((item) => (
              <Link
                key={item}
                to="#"
                className="text-[11px] text-[#6fa0be] hover:underline"
              >
                {item}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
