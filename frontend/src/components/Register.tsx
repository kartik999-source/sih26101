import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Building2, 
  Briefcase,
  ArrowRight,
  Lock,
  Mail,
  User,
  Hash,
  Calendar,
  Search,
  ChevronDown,
  Check,
  Building,
  Plus,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../types';
import { 
  COLLEGES_DATA, 
  DEPARTMENTS_DATA, 
  MENTOR_COMPANIES_DATA, 
  MENTOR_EXPERTISE_TAGS,
  CollegeItem 
} from '../data/colleges';

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: {
    name: string;
    role: UserRole;
    email: string;
    department?: string;
    college?: CollegeItem | null;
    batch?: string;
    rollNo?: string;
    company?: string;
    expertise?: string[];
  }) => void;
  initialRole?: UserRole;
}

export const Register: React.FC<RegisterProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  initialRole = 'student'
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);

  // --- Student Fields ---
  const [studentName, setStudentName] = useState('Adarsh Pratap Singh');
  const [academicYear, setAcademicYear] = useState('2025-29');
  
  // Department dropdown state
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS_DATA[0]);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const deptRef = useRef<HTMLDivElement>(null);

  // College dropdown state
  const [selectedCollege, setSelectedCollege] = useState<CollegeItem>(COLLEGES_DATA[0]);
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const collegeRef = useRef<HTMLDivElement>(null);

  const [studentEmail, setStudentEmail] = useState('adarsh.pratap@mjpru.ac.in');
  const [studentPassword, setStudentPassword] = useState('password123');

  // --- Mentor Fields ---
  const [mentorName, setMentorName] = useState('Amit Verma');
  const [mentorEmail, setMentorEmail] = useState('amit.verma@tcs.com');
  const [mentorPassword, setMentorPassword] = useState('password123');
  const [mentorCompanyPreset, setMentorCompanyPreset] = useState(MENTOR_COMPANIES_DATA[0]);
  const [customCompany, setCustomCompany] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([
    'Full Stack',
    'AI/ML',
    'Cloud & DevOps'
  ]);
  const [newTagInput, setNewTagInput] = useState('');

  // --- HOD Fields ---
  const [hodName, setHodName] = useState('Dr. Arvind K. Sharma');
  const [hodEmail, setHodEmail] = useState('hod.csit@mjpru.ac.in');
  const [hodPassword, setHodPassword] = useState('password123');
  const [hodCollege, setHodCollege] = useState<CollegeItem>(COLLEGES_DATA[0]);
  const [isHodCollegeOpen, setIsHodCollegeOpen] = useState(false);
  const [hodCollegeSearch, setHodCollegeSearch] = useState('');
  const hodCollegeRef = useRef<HTMLDivElement>(null);
  
  const [hodDept, setHodDept] = useState(DEPARTMENTS_DATA[0]);
  const [isHodDeptOpen, setIsHodDeptOpen] = useState(false);
  const [hodDeptSearch, setHodDeptSearch] = useState('');
  const hodDeptRef = useRef<HTMLDivElement>(null);

  // --- Recruiter Fields ---
  const [recruiterName, setRecruiterName] = useState('Priya Sengupta');
  const [recruiterEmail, setRecruiterEmail] = useState('priya.recruiter@google.com');
  const [recruiterCompany, setRecruiterCompany] = useState('Google Cloud Partners');
  const [recruiterPassword, setRecruiterPassword] = useState('password123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setIsDeptOpen(false);
      }
      if (collegeRef.current && !collegeRef.current.contains(e.target as Node)) {
        setIsCollegeOpen(false);
      }
      if (hodCollegeRef.current && !hodCollegeRef.current.contains(e.target as Node)) {
        setIsHodCollegeOpen(false);
      }
      if (hodDeptRef.current && !hodDeptRef.current.contains(e.target as Node)) {
        setIsHodDeptOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter lists
  const filteredDepts = DEPARTMENTS_DATA.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredColleges = COLLEGES_DATA.filter(c => 
    c.name.toLowerCase().includes(collegeSearch.toLowerCase()) || 
    c.city.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.short.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const filteredHodColleges = COLLEGES_DATA.filter(c => 
    c.name.toLowerCase().includes(hodCollegeSearch.toLowerCase()) || 
    c.city.toLowerCase().includes(hodCollegeSearch.toLowerCase()) ||
    c.short.toLowerCase().includes(hodCollegeSearch.toLowerCase())
  );

  const filteredHodDepts = DEPARTMENTS_DATA.filter(d => 
    d.name.toLowerCase().includes(hodDeptSearch.toLowerCase()) || 
    d.code.toLowerCase().includes(hodDeptSearch.toLowerCase())
  );

  const toggleExpertise = (tag: string) => {
    if (selectedExpertise.includes(tag)) {
      setSelectedExpertise(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedExpertise(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!selectedExpertise.includes(newTagInput.trim())) {
        setSelectedExpertise(prev => [...prev, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'student') {
        const studentProfile = {
          name: studentName,
          email: studentEmail,
          department: selectedDept.name,
          departmentCode: selectedDept.code,
          college: selectedCollege.name,
          collegeShort: selectedCollege.short,
          collegeLogo: selectedCollege.logo,
          year: academicYear,
          role: 'student' as UserRole,
          location: 'Bareilly, Uttar Pradesh, India',
          photo: localStorage.getItem('profilePhoto') || null
        };

        localStorage.setItem('userProfile', JSON.stringify(studentProfile));
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('role', 'student');
        localStorage.setItem('userName', studentName);
        localStorage.setItem('userEmail', studentEmail);
        localStorage.setItem('userCourse', selectedDept.name);
        localStorage.setItem('userCollege', selectedCollege.name);
        localStorage.setItem('userYear', academicYear);
        localStorage.setItem('roleLocked', 'true');

        onRegisterSuccess({
          name: studentName,
          role: 'student',
          email: studentEmail,
          department: selectedDept.name,
          college: selectedCollege,
          batch: academicYear
        });
      } else if (activeTab === 'mentor') {
        const companyStr = customCompany.trim() || mentorCompanyPreset;
        const mentorProfile = {
          name: mentorName,
          email: mentorEmail,
          company: companyStr,
          expertise: selectedExpertise,
          role: 'mentor' as UserRole,
          department: selectedExpertise[0] || 'Software Architecture',
          college: companyStr,
          year: 'Senior Mentor'
        };

        localStorage.setItem('userProfile', JSON.stringify(mentorProfile));
        localStorage.setItem('userRole', 'Mentor');
        localStorage.setItem('role', 'mentor');
        localStorage.setItem('userName', mentorName);
        localStorage.setItem('userEmail', mentorEmail);
        localStorage.setItem('roleLocked', 'true');

        onRegisterSuccess({
          name: mentorName,
          role: 'mentor',
          email: mentorEmail,
          company: companyStr,
          expertise: selectedExpertise
        });
      } else if (activeTab === 'hod') {
        const hodProfile = {
          name: hodName,
          email: hodEmail,
          college: hodCollege.name,
          collegeShort: hodCollege.short,
          department: hodDept.name,
          departmentCode: hodDept.code,
          role: 'hod' as UserRole,
          year: 'Department Head'
        };

        localStorage.setItem('userProfile', JSON.stringify(hodProfile));
        localStorage.setItem('userRole', 'HOD');
        localStorage.setItem('role', 'hod');
        localStorage.setItem('userName', hodName);
        localStorage.setItem('userEmail', hodEmail);
        localStorage.setItem('userCollege', hodCollege.name);
        localStorage.setItem('userCourse', hodDept.name);
        localStorage.setItem('roleLocked', 'true');

        onRegisterSuccess({
          name: hodName,
          role: 'hod',
          email: hodEmail,
          college: hodCollege,
          department: hodDept.name
        });
      } else {
        // Recruiter
        const recProfile = {
          name: recruiterName,
          email: recruiterEmail,
          company: recruiterCompany,
          role: 'company' as UserRole,
          year: 'Talent Acquisition'
        };

        localStorage.setItem('userProfile', JSON.stringify(recProfile));
        localStorage.setItem('userRole', 'company');
        localStorage.setItem('role', 'company');
        localStorage.setItem('userName', recruiterName);
        localStorage.setItem('roleLocked', 'true');

        onRegisterSuccess({
          name: recruiterName,
          role: 'company',
          email: recruiterEmail,
          company: recruiterCompany
        });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 select-none font-sans">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-[#0B0F2A] border border-white/[0.1] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-10 animate-fade-in my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-5 pb-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-sm">
              SB
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Ladder</span>
              </h2>
              <p className="text-xs text-white/45">3-Pathway Academic & Industry Onboarding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Role Selector Tabs with #7C5CFC active color */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-4 p-1 rounded-xl bg-[#121633] border border-white/[0.06] gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('mentor'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mentor'
                  ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('hod'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hod'
                  ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>HOD</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('company'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'company'
                  ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form id="registerForm" onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* ========================================================= */}
            {/* 1. STUDENT REGISTRATION PATHWAY (Screenshots & Full Spec) */}
            {/* ========================================================= */}
            {activeTab === 'student' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Full Name <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Adarsh Pratap Singh"
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Academic Year <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="2023-27">2023-27</option>
                      <option value="2024-28">2024-28</option>
                      <option value="2025-29">2025-29</option>
                      <option value="2026-30">2026-30</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Department / Branch Dropdown Top-down List */}
                <div className="relative" ref={deptRef}>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Department / Branch <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDeptOpen(!isDeptOpen)}
                    className="w-full bg-[#1A1F3D] border border-white/[0.08] hover:border-[#7C5CFC]/50 text-white text-xs rounded-xl px-3 py-2.5 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{selectedDept.icon}</span>
                      <span className="font-semibold text-white truncate">{selectedDept.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-white/60 font-mono">
                        {selectedDept.code}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isDeptOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Search Menu */}
                  {isDeptOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151A32] border border-white/[0.1] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 p-2 max-h-56 overflow-y-auto">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                          placeholder="Search department or branch code..."
                          className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-[11px] rounded-lg pl-8 pr-2 py-1.5 outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-0.5">
                        {filteredDepts.map((d) => (
                          <button
                            type="button"
                            key={d.name}
                            onClick={() => {
                              setSelectedDept(d);
                              setIsDeptOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              selectedDept.name === d.name 
                                ? 'bg-[#7C5CFC]/20 text-white font-bold' 
                                : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-sm">{d.icon}</span>
                              <span className="truncate">{d.name}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/50 font-mono shrink-0">
                              {d.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* College / University Dropdown with Original Logo */}
                <div className="relative" ref={collegeRef}>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    College / University <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCollegeOpen(!isCollegeOpen)}
                    className="w-full bg-[#1A1F3D] border border-white/[0.08] hover:border-[#7C5CFC]/50 text-white text-xs rounded-xl p-2 sm:px-3 sm:py-2 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img 
                          src={selectedCollege.logo} 
                          alt={selectedCollege.short}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/9/93/MJPRU_logo.png";
                          }}
                        />
                      </div>
                      <div className="text-left min-w-0 truncate">
                        <p className="font-semibold text-white text-xs truncate">{selectedCollege.name}</p>
                        <p className="text-[10px] text-white/40">{selectedCollege.city} · {selectedCollege.short}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isCollegeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Searchable College Dropdown */}
                  {isCollegeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151A32] border border-white/[0.1] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 p-2 max-h-64 overflow-y-auto">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          placeholder="Search university by name, short or city..."
                          className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-[11px] rounded-lg pl-8 pr-2 py-1.5 outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        {filteredColleges.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setSelectedCollege(c);
                              setIsCollegeOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                              selectedCollege.id === c.id 
                                ? 'bg-[#7C5CFC]/25 border border-[#7C5CFC]/40 text-white font-bold' 
                                : 'hover:bg-white/[0.04] text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                                <img 
                                  src={c.logo} 
                                  alt={c.short}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/9/93/MJPRU_logo.png";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{c.name}</p>
                                <p className="text-[10px] text-white/45">{c.city} · {c.short}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-white/[0.06] text-white/50 shrink-0 ml-2">
                              {c.city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Official Email <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="adarsh.pratap@mjpru.ac.in"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Password <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 2. MENTOR REGISTRATION PATHWAY (Only Mentor Fields)        */}
            {/* ========================================================= */}
            {activeTab === 'mentor' && (
              <>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11.5px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Industry Mentorship Gateway: Direct access to 1-on-1 Capsules and Proof-of-Work Verifications.</span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Full Name <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                      placeholder="e.g. Amit Verma"
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Official Email <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={mentorEmail}
                        onChange={(e) => setMentorEmail(e.target.value)}
                        placeholder="amit.verma@tcs.com"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Password <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={mentorPassword}
                        onChange={(e) => setMentorPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Company / Experience (Dropdown + custom input) */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Company / Experience <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={mentorCompanyPreset}
                        onChange={(e) => {
                          setMentorCompanyPreset(e.target.value);
                          setCustomCompany('');
                        }}
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none appearance-none cursor-pointer"
                      >
                        {MENTOR_COMPANIES_DATA.map((comp) => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="Or enter custom enterprise name & title (e.g. Cisco - 6 Yrs)..."
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                {/* Expertise Tags */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Core Technical Expertise
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {MENTOR_EXPERTISE_TAGS.map((tag) => {
                      const isSel = selectedExpertise.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleExpertise(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSel 
                              ? 'bg-[#7C5CFC] border-[#7C5CFC] text-white shadow-xs' 
                              : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="Type custom skill and press Enter..."
                    className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-[11px] rounded-xl px-3 py-1.5 outline-none"
                  />
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 3. HOD REGISTRATION PATHWAY (Only HOD Dashboard Fields)   */}
            {/* ========================================================= */}
            {activeTab === 'hod' && (
              <>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11.5px] flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>University Department Governance: Access Curriculum Gap Analytics and Student Career Ledger.</span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Full Name & Title <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={hodName}
                      onChange={(e) => setHodName(e.target.value)}
                      placeholder="e.g. Dr. Arvind K. Sharma"
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* College / University Dropdown */}
                <div className="relative" ref={hodCollegeRef}>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    College / University <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHodCollegeOpen(!isHodCollegeOpen)}
                    className="w-full bg-[#1A1F3D] border border-white/[0.08] hover:border-[#7C5CFC]/50 text-white text-xs rounded-xl p-2 sm:px-3 sm:py-2 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img 
                          src={hodCollege.logo} 
                          alt={hodCollege.short}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left min-w-0 truncate">
                        <p className="font-semibold text-white text-xs truncate">{hodCollege.name}</p>
                        <p className="text-[10px] text-white/40">{hodCollege.city} · {hodCollege.short}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isHodCollegeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Searchable College Dropdown */}
                  {isHodCollegeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151A32] border border-white/[0.1] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 p-2 max-h-64 overflow-y-auto">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={hodCollegeSearch}
                          onChange={(e) => setHodCollegeSearch(e.target.value)}
                          placeholder="Search university..."
                          className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-[11px] rounded-lg pl-8 pr-2 py-1.5 outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        {filteredHodColleges.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setHodCollege(c);
                              setIsHodCollegeOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                              hodCollege.id === c.id 
                                ? 'bg-[#7C5CFC]/25 border border-[#7C5CFC]/40 text-white font-bold' 
                                : 'hover:bg-white/[0.04] text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                                <img src={c.logo} alt={c.short} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{c.name}</p>
                                <p className="text-[10px] text-white/45">{c.city} · {c.short}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-white/[0.06] text-white/50 shrink-0 ml-2">
                              {c.city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Department / Branch Dropdown */}
                <div className="relative" ref={hodDeptRef}>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Department / Branch <span className="text-[#7C5CFC]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHodDeptOpen(!isHodDeptOpen)}
                    className="w-full bg-[#1A1F3D] border border-white/[0.08] hover:border-[#7C5CFC]/50 text-white text-xs rounded-xl px-3 py-2.5 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{hodDept.icon}</span>
                      <span className="font-semibold text-white truncate">{hodDept.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-white/60 font-mono">
                        {hodDept.code}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isHodDeptOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isHodDeptOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151A32] border border-white/[0.1] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 p-2 max-h-56 overflow-y-auto">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={hodDeptSearch}
                          onChange={(e) => setHodDeptSearch(e.target.value)}
                          placeholder="Search department..."
                          className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-[11px] rounded-lg pl-8 pr-2 py-1.5 outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-0.5">
                        {filteredHodDepts.map((d) => (
                          <button
                            type="button"
                            key={d.name}
                            onClick={() => {
                              setHodDept(d);
                              setIsHodDeptOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              hodDept.name === d.name 
                                ? 'bg-[#7C5CFC]/20 text-white font-bold' 
                                : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-sm">{d.icon}</span>
                              <span className="truncate">{d.name}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/50 font-mono shrink-0">
                              {d.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Official Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Official University Email <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={hodEmail}
                        onChange={(e) => setHodEmail(e.target.value)}
                        placeholder="hod.csit@mjpru.ac.in"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Password <span className="text-[#7C5CFC]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={hodPassword}
                        onChange={(e) => setHodPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 4. RECRUITER REGISTRATION                                 */}
            {/* ========================================================= */}
            {activeTab === 'company' && (
              <>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11.5px] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>Verified Recruiter Portal: Post micro-internships & hire verified student talent.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="e.g. Priya Sengupta"
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">Company / Hiring Partner</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                      placeholder="e.g. Google Cloud Partners"
                      className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={recruiterEmail}
                        onChange={(e) => setRecruiterEmail(e.target.value)}
                        placeholder="priya.recruiter@google.com"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={recruiterPassword}
                        onChange={(e) => setRecruiterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1A1F3D] border border-white/[0.08] focus:border-[#7C5CFC] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Submit Button */}
        <div className="p-4 bg-[#0F1433] border-t border-white/[0.08] flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/45 hidden sm:block">
            {activeTab === 'student' ? 'Syncs verified credentials & cryptographic passport.' : 'Enforces strict role-based dashboard gateway.'}
          </p>

          <button
            type="submit"
            form="registerForm"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6D4AE8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading 
                ? 'Validating Pathway...' 
                : activeTab === 'student' 
                  ? 'Register & Sync Profile ->' 
                  : activeTab === 'mentor'
                    ? 'Register as Mentor ->'
                    : activeTab === 'hod'
                      ? 'Register as HOD ->'
                      : 'Register as Recruiter ->'
              }
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
