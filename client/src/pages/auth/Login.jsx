
import { useState } from 'react';
import { Upload, Eye, EyeOff, Building2, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../config/constants';
import { cn } from '../../utils/cn';


function InputField({ icon: Icon, type, name, placeholder, value, onChange, isPassword = false, showPassword, setShowPassword }) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.3em] text-[#b28fa1]">
        {name.replace(/([A-Z])/g, ' $1').trim()}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-[#c4a3b3] transition-colors duration-300 group-focus-within:text-[#75516c]" />
        </div>
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 pl-10 pr-4 py-3 text-sm text-[#2f1a2c] placeholder:text-[#c4a3b3] shadow-[0_10px_30px_rgba(117,81,108,0.08)] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#c4a3b3] transition hover:text-[#75516c]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [persona, setPersona] = useState(USER_ROLES.EMPLOYEE);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    fullName: '',
    phone: '',
    logo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailHandle = formData.email?.toLowerCase() || '';
    const userPayload = {
      id: emailHandle ? emailHandle.slice(0, 6).toUpperCase() : 'DF-000',
      name: formData.fullName || 'Jordan Patel',
      email: formData.email || 'guest@dayflow.com',
      role: persona,
      avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(formData.fullName || 'Dayflow')}`,
      location: 'Dayflow HQ',
    };

    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    login(userPayload, token);
    const redirectPath = persona === USER_ROLES.EMPLOYEE ? ROUTES.EMPLOYEE_DASHBOARD : ROUTES.ADMIN_DASHBOARD;
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff9fb] via-[#fdeff3] to-[#fbe4ed] p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-0 h-48 w-48 rounded-full bg-[#f2c9d8] blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#f6dfe8] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-[rgba(117,81,108,0.18)] bg-white/90 shadow-[0_25px_70px_rgba(117,81,108,0.18)] backdrop-blur-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f0c9d9] via-[#d69ab6] to-[#75516c]" />

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(117,81,108,0.25)] bg-[#fff4f7]">
              <Building2 className="h-6 w-6 text-[#75516c]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2f1a2c]">
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h2>
            <p className="mt-2 text-sm text-[#8f6d80]">
              {isLogin ? 'Enter your credentials to access your workspace' : 'Create your company workspace in seconds'}
            </p>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b28fa1]">Select portal</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-[#fef4f7] p-1">
              {[
                { label: 'Employee', value: USER_ROLES.EMPLOYEE, hint: 'Access attendance & profiles' },
                { label: 'Admin / HR', value: USER_ROLES.HR_OFFICER, hint: 'Approve leave & payroll' },
              ].map((option) => {
                const isActive = persona === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPersona(option.value)}
                    className={cn(
                      'rounded-2xl px-3 py-3 text-left transition',
                      isActive ? 'bg-white shadow-[0_10px_25px_rgba(117,81,108,0.18)]' : 'text-[#8f6d80]'
                    )}
                  >
                    <p className={cn('text-sm font-semibold', isActive ? 'text-[#2f1a2c]' : '')}>{option.label}</p>
                    <p className="text-xs text-[#b28fa1]">{option.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="flex gap-3">
                    <div className="flex-1">
                         <InputField icon={Building2} type="text" name="companyName" placeholder="Acme Inc." value={formData.companyName} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
                    </div>
                    {/* Logo Upload - Fixed Styling */}
                     <div className="w-16">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.3em] text-[#b28fa1]">Logo</label>
                        <label className="group flex h-[46px] w-full cursor-pointer items-center justify-center rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 transition hover:border-[#75516c]">
                            <Upload className="h-5 w-5 text-[#c4a3b3] transition group-hover:text-[#75516c]" />
                            <input type="file" className="hidden" />
                        </label>
                     </div>
                </div>
                <InputField icon={User} type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
                <InputField icon={Phone} type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
              </>
            )}


            <InputField 
              icon={Mail} 
              type="text" 
              name="email" 
              placeholder={isLogin ? "OIJODO20220001" : "hr@company.com"} 
              value={formData.email} 
              onChange={handleChange} 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            
            <InputField 
              icon={Lock} 
              type="password" 
              name="password" 
              placeholder="********" 
              isPassword={true} 
              value={formData.password} 
              onChange={handleChange} 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />


            {!isLogin && (
               <InputField 
              icon={Lock} 
              type="password" 
              name="confirmPassword" 
              placeholder="********" 
              isPassword={true} 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            )}

            <button
              type="submit"
              className="group mt-6 flex w-full items-center justify-center rounded-xl bg-[#75516c] py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(117,81,108,0.35)] transition hover:bg-[#6a4a63]"
            >
              {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 border-t border-[rgba(117,81,108,0.2)] pt-6 text-center">
            <p className="text-sm text-[#8f6d80]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-[#75516c] underline-offset-4 transition hover:text-[#5f4056]"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}