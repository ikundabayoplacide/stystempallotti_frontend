import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Card, Input, SectionTitle } from "../components/ui";
import { useForgotPasswordMutation } from "../store/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-4">
      <Card className="!rounded-3xl !border-0 !bg-primary-700 !px-8 !py-10 w-full max-w-sm shadow-xl">
        <SectionTitle
          title="Forgot Password"
          align="center"
          className="mb-6 [&_h2]:text-secondary-200 [&_h2]:text-2xl"
        />

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-secondary-200 text-sm">
              If that email exists in our system, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none select-none z-10">
                <FiMail className="w-4 h-4" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                fullWidth
                className="!bg-secondary-200 !border-transparent pl-9 focus:!border-primary-300 focus:!ring-primary-300/40"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              className="!bg-yellow-400 hover:!bg-yellow-300 active:!bg-yellow-500 !text-secondary-100 tracking-widest uppercase focus:!ring-yellow-300/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link to="/login" className="text-center text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              Back to Login
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
