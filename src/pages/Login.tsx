import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Droplets } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    const loginEmail = email.includes("@") ? email : `${email}@uap-bd.edu`;
    const { error } = await signIn(loginEmail, password);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Welcome back!");
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px]" style={{ background: "hsl(353 98% 41%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>

        <div className="card-gradient rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center">
              <Droplets size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Welcome Back</h1>
              <p className="text-xs text-muted-foreground">Sign in to UapBlood</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">UAP Email or Registration ID</Label>
              <Input placeholder="name@uap-bd.edu or 21201XXX" className="bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-muted-foreground text-sm">Password</Label>
                <a href="#" className="text-xs text-accent hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gradient rounded-full font-heading font-semibold text-base h-12 shadow-[0_4px_20px_rgba(208,2,27,0.4)]">
              {loading ? "Signing In..." : "Login"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline font-medium">Sign Up</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
