import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Card, PasswordInput, SectionTitle } from "../components/ui";
import { useResetPasswordMutation } from "../store/services/authService";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch {
      toast.error("Reset link is invalid or has expired.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-4">
      <Card className="!rounded-3xl !border-0 !bg-primary-700 !px-8 !py-10 w-full max-w-sm shadow-xl">
        <SectionTitle
          title="Reset Password"
          align="center"
          className="mb-6 [&_h2]:text-secondary-200 [&_h2]:text-2xl"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none select-none z-10">
              <FiLock className="w-4 h-4" />
            </span>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              inputClassName="!bg-secondary-200 !border-transparent pl-9 focus:!border-primary-300 focus:!ring-primary-300/40 !rounded-xl"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none select-none z-10">
              <FiLock className="w-4 h-4" />
            </span>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              inputClassName="!bg-secondary-200 !border-transparent pl-9 focus:!border-primary-300 focus:!ring-primary-300/40 !rounded-xl"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isLoading}
            className="!bg-yellow-400 hover:!bg-yellow-300 active:!bg-yellow-500 !text-secondary-100 tracking-widest uppercase focus:!ring-yellow-300/60 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <Link to="/login" className="text-center text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
            Back to Login
          </Link>
        </form>
      </Card>
    </div>
  );
}
