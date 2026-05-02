import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const departments = [
  "Computer Science & Engineering (CSE)", "Electrical & Electronic Engineering (EEE)",
  "Civil Engineering (CE)", "Architecture", "Business Administration (BBA/MBA)",
  "English", "Law", "Pharmacy",
];
const semesters = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "Alumni"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Props {
  filters: { departments: string[]; semesters: string[]; bloodGroups: string[]; availableOnly: boolean };
  setFilters: React.Dispatch<React.SetStateAction<Props["filters"]>>;
}

export function DashboardFilters({ filters, setFilters }: Props) {
  const toggle = (key: "departments" | "semesters" | "bloodGroups", value: string) => {
    setFilters((p) => ({ ...p, [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value] }));
  };

  return (
    <div className="card-gradient rounded-2xl p-5 space-y-6 sticky top-20" style={{ background: "rgba(12,4,7,0.95)" }}>
      <h3 className="font-heading font-bold text-white text-sm">Filters</h3>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Department</Label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {departments.map((d) => (
            <label key={d} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
              <Checkbox checked={filters.departments.includes(d)} onCheckedChange={() => toggle("departments", d)} />
              <span className="truncate">{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Semester</Label>
        <div className="flex flex-wrap gap-1.5">
          {semesters.map((s) => (
            <button key={s} onClick={() => toggle("semesters", s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filters.semesters.includes(s) ? "btn-gradient border-transparent text-white" : "border-accent/20 text-gray-500 hover:text-white hover:border-accent/40"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Blood Group</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {bloodGroups.map((bg) => (
            <button key={bg} onClick={() => toggle("bloodGroups", bg)}
              className={`text-xs px-2 py-1.5 rounded-lg border font-bold transition-all ${filters.bloodGroups.includes(bg) ? "btn-gradient border-transparent text-white" : "border-accent/20 text-gray-500 hover:text-white hover:border-accent/40"}`}>{bg}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-300">Available Now</Label>
        <Switch checked={filters.availableOnly} onCheckedChange={(v) => setFilters((p) => ({ ...p, availableOnly: v }))} />
      </div>

      <Button variant="outline" size="sm" className="w-full btn-outline-subtle rounded-full text-xs"
        onClick={() => setFilters({ departments: [], semesters: [], bloodGroups: [], availableOnly: false })}>Clear Filters</Button>
    </div>
  );
}
