import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const departments = [
  "Computer Science & Engineering (CSE)",
  "Electrical & Electronic Engineering (EEE)",
  "Civil Engineering (CE)",
  "Architecture",
  "Business Administration (BBA/MBA)",
  "English",
  "Law",
  "Pharmacy",
];
const semesters = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];
const sections = ["A", "B", "C", "D", "E"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [tab, setTab] = useState<"student" | "alumni">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: "", section: "", semester: "", graduationYear: "", bloodGroup: "", phone: "", password: "", confirmPassword: "", agreed: false });
  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-destructive", "bg-gold", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];
  const updateForm = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email or Reg ID is required";
    if (form.email.includes("@") && !form.email.endsWith("@uap-bd.edu")) return "Email must end with @uap-bd.edu";
    if (!form.email.includes("@") && !/^\d{8,}$/.test(form.email)) return "Registration ID must be at least 8 digits";
    if (!form.department) return "Department is required";
    if (!form.bloodGroup) return "Blood group is required";
    if (tab === "student" && !form.semester) return "Semester is required";
    if (tab === "alumni" && !form.graduationYear) return "Graduation year is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.agreed) return "You must agree to the terms";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    const email = form.email.includes("@") ? form.email : `${form.email}@uap-bd.edu`;
    const { data, error } = await signUp(email, form.password, {
      name: form.name, department: form.department, blood_group: form.bloodGroup, section: form.section,
      semester: tab === "student" ? form.semester : "", is_alumni: String(tab === "alumni"),
      graduation_year: tab === "alumni" ? form.graduationYear : "", phone: form.phone,
      reg_id: !form.email.includes("@") ? form.email : "",
    });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Wait for trigger to create profile, then update extra fields
    if (data?.user) {
      await new Promise((r) => setTimeout(r, 500));
      await supabase.from("profiles").update({
        reg_id: !form.email.includes("@") ? form.email : null, section: form.section,
        semester: tab === "student" ? form.semester : null, is_alumni: tab === "alumni",
        graduation_year: tab === "alumni" ? form.graduationYear : null, phone: form.phone || null, blood_group: form.bloodGroup,
      }).eq("user_id", data.user.id);
    }
    toast.success("Account created successfully!");
    navigate("/dashboard");
    setLoading(false);
  };

  const inputCls = "bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: "hsl(353 98% 41%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
        <div className="card-gradient rounded-2xl p-8">
          <h1 className="text-3xl font-heading font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join the UapBlood community</p>

          <div className="flex rounded-full p-1 mb-6 bg-card border border-border/50">
            {(["student", "alumni"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-sm font-medium py-2.5 rounded-full transition-all capitalize ${tab === t ? "btn-gradient shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "alumni" ? "🎓 Alumni" : "🎒 Student"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Full Name</Label>
              <Input placeholder="Enter your full name" className={inputCls} value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">UAP Email or Registration ID</Label>
              <Input placeholder="name@uap-bd.edu or 21201XXX" className={inputCls} value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Department</Label>
                <Select value={form.department} onValueChange={(v) => updateForm("department", v)}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Section</Label>
                <Select value={form.section} onValueChange={(v) => updateForm("section", v)}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {tab === "student" ? (
                  <><Label className="text-muted-foreground text-sm mb-1.5 block">Semester</Label>
                  <Select value={form.semester} onValueChange={(v) => updateForm("semester", v)}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{semesters.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select></>
                ) : (
                  <><Label className="text-muted-foreground text-sm mb-1.5 block">Graduation Year</Label>
                  <Input placeholder="e.g. 2024" className={inputCls} value={form.graduationYear} onChange={(e) => updateForm("graduationYear", e.target.value)} /></>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => updateForm("bloodGroup", v)}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Phone Number (optional)</Label>
              <Input placeholder="+880-1XXXXXXXXX" className={inputCls} value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" className={`${inputCls} pr-10`} value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">{[1,2,3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-muted"}`} />)}</div>
                  <span className="text-xs text-muted-foreground">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Confirm Password</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" className={`${inputCls} pr-10`} value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" className="mt-0.5" checked={form.agreed} onCheckedChange={(v) => updateForm("agreed", !!v)} />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">I agree to the terms & conditions and consent to my blood group being visible to the UAP community.</label>
            </div>
            <Button type="submit" disabled={loading} className="w-full btn-gradient rounded-full font-heading font-semibold text-base h-12 shadow-[0_4px_20px_rgba(208,2,27,0.4)]">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Login</Link></p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
