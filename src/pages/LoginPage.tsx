import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState } from "react";
import { FiLock, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import loginAnimation from "../assets/Login.json";
import { Button, Card, Input, SectionTitle } from "../components/ui";
import { useAuth } from "../context/AuthContext";



export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Login submitted with username:", username);
    
    // TODO: Replace with actual authentication logic
    // For now, route based on username
    const userRole = username.toLowerCase();
    console.log("User role detected:", userRole);
    
    let role: import("../context/AuthContext").UserRole = "admin";
    let department: import("../context/AuthContext").Department | undefined = undefined;
    let route = "/admin";
    
    if (userRole.includes("admin") || userRole.includes("director")) {
      role = "admin";
      route = "/admin";
    } else if (userRole.includes("reception")) {
      role = "receptionist";
      department = "reception";
      route = "/reception";
    } else if (userRole.includes("sales")) {
      role = "sales";
      department = "sales";
      route = "/sales";
    } else if (userRole.includes("daf")) {
      role = "daf";
      department = "finance";
      route = "/finance/daf";
    } else if (userRole.includes("accountant1") || userRole.includes("acc1")) {
      role = "accountant1";
      department = "finance";
      route = "/finance/accountant1";
    } else if (userRole.includes("accountant2") || userRole.includes("acc2")) {
      role = "accountant2";
      department = "finance";
      route = "/finance/accountant2";
    } else if (userRole.includes("production-manager") || userRole.includes("prodmanager")) {
      role = "production-manager";
      department = "management";
      route = "/production-manager";
    } else if (userRole.includes("stock")) {
      role = "stock";
      department = "stock";
      route = "/stock";
    } else if (userRole.includes("supervisor")) {
      role = "supervisor";
      department = "management";
      route = "/supervisor";
    } else if (userRole.includes("worker")) {
      role = "worker";
      // Determine department from username
      if (userRole.includes("composition")) {
        department = "composition";
      } else if (userRole.includes("montage")) {
        department = "montage";
      } else if (userRole.includes("printing")) {
        department = "printing";
      } else if (userRole.includes("binding")) {
        department = "binding";
      } else if (userRole.includes("packaging")) {
        department = "packaging";
      } else {
        department = "printing"; // default
      }
      route = "/worker";
    }
    
    console.log("Navigating to:", route, "Department:", department);
    
    // Set authentication state
    login(role, username, department);
    
    // Navigate to appropriate dashboard
    navigate(route);
  };

  return (
    <div
      className="
        min-h-screen w-full flex items-center justify-center
        bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900
        px-4 xs:px-6 sm:px-8
      "
    >
      {/* Outer card — white/light container */}
      <Card
        className="
          !p-0 !rounded-3xl !border-0
          w-full max-w-xs xxs:max-w-sm xs:max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl
          bg-custom-50 shadow-2xl overflow-hidden
          flex flex-col md:flex-row
        "
      >
        {/* Left — illustration */}

        <div
          className="
            hidden md:flex flex-1 items-center justify-center
            bg-gradient-to-br from-primary-400 to-primary-900
            p-8 lg:p-12 flex flex-col
          "
        >
          <div className="text-white lg:text-2xl">
            <h1>Welcome to Job Trucking System</h1>
          </div>
          <DotLottieReact
            data={loginAnimation}
            loop
            autoplay
            className="w-full max-w-xs lg:max-w-sm xl:max-w-md"
          />
        </div>

        {/* Right — login form card */}
        <Card
          className="
            !rounded-3xl !border-0
            flex flex-col justify-center
            w-full md:w-80 lg:w-96 xl:w-[26rem]
            !bg-primary-700
            !px-8 !py-10 xs:!px-10 xs:!py-12
            m-0 md:m-4 lg:m-6
            shadow-xl
          "
        >
          {/* Title */}
          <SectionTitle
            title="Login"
            align="center"
            className="mb-8 [&_h2]:text-secondary-200 [&_h2]:text-2xl xs:[&_h2]:text-3xl"
          />

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* Username */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none select-none z-10">
                <FiUser className="w-4 h-4" />
              </span>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                fullWidth
                className="!bg-secondary-200 !border-transparent pl-9 focus:!border-primary-300 focus:!ring-primary-300/40"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none select-none z-10">
                <FiLock className="w-4 h-4" />
              </span>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                fullWidth
                className="!bg-secondary-200 !border-transparent pl-9 focus:!border-primary-300 focus:!ring-primary-300/40"
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-yellow-400 cursor-pointer"
                />
                <span className="text-xs text-secondary-200 font-[family-name:var(--font-family-primary)]">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="
                  text-xs text-yellow-400 hover:text-yellow-300
                  font-[family-name:var(--font-family-primary)]
                  transition-colors duration-200
                  focus:outline-none focus:underline
                "
              >
                Forgot your password?
              </a>
            </div>

            {/* Login button — yellow override via className */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="
                !bg-yellow-400 hover:!bg-yellow-300 active:!bg-yellow-500
                !text-secondary-100 tracking-widest uppercase
                focus:!ring-yellow-300/60
              "
            >
              Login
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-xs text-primary-200 font-[family-name:var(--font-family-primary)]">
            New here?{" "}
            <a
              href="#"
              className="
                font-bold text-secondary-200 hover:text-yellow-400
                transition-colors duration-200
                focus:outline-none focus:underline
              "
            >
              Sign Up
            </a>
          </p>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 rounded-xl bg-primary-800/50 border border-primary-600">
            <p className="text-xs font-bold text-yellow-400 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-[10px] text-primary-200">
              <p><span className="text-yellow-400">Admin:</span> admin / director</p>
              <p><span className="text-yellow-400">Workers:</span> worker-printing / worker-binding / worker-composition / worker-montage / worker-packaging</p>
              <p><span className="text-yellow-400">Other:</span> reception / sales / supervisor / stock / daf</p>
            </div>
          </div> */}
        </Card>
      </Card>
    </div>
  );
}
