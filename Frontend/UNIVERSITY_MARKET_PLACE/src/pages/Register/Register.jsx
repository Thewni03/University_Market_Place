import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const url = `${API_BASE_URL}/users`;

const validate = (inputs, file) => {
  const errors = {}

  if (!inputs.email)
    errors.email = "Email is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email))
    errors.email = "Enter a valid email address"

  if (!inputs.password)
    errors.password = "Password is required"
  else if (inputs.password.length < 8)
    errors.password = "Password must be at least 8 characters"
  else if (!/[A-Z]/.test(inputs.password))
    errors.password = "Password must contain at least one uppercase letter"
  else if (!/[0-9]/.test(inputs.password))
    errors.password = "Password must contain at least one number"

  if (!inputs.fullname.trim())
    errors.fullname = "Full name is required"
  else if (inputs.fullname.trim().length < 3)
    errors.fullname = "Name must be at least 3 characters"
  else if (!/^[a-zA-Z\s]+$/.test(inputs.fullname))
    errors.fullname = "Name must contain letters only"

  if (!inputs.student_id.trim())
    errors.student_id = "Student ID is required"
  else if (!/^[A-Za-z]{2}\d{8}$/.test(inputs.student_id))
    errors.student_id = "Invalid format (e.g. IT479463)"

  if (!inputs.university_name.trim())
    errors.university_name = "University name is required"

  if (!inputs.phone.trim())
    errors.phone = "Phone number is required"
  else if (!/^(?:0|94|\+94)?[0-9]{9}$/.test(inputs.phone.replace(/\s/g, '')))
    errors.phone = "Enter a valid Sri Lankan phone number (e.g. 0771234567)"

  if (!inputs.graduate_year)
    errors.graduate_year = "Graduate year is required"
  else if (inputs.graduate_year < 2020 || inputs.graduate_year > 2035)
    errors.graduate_year = "Enter a valid graduate year (2020 - 2035)"

  if (!file)
    errors.student_id_pic = "Student ID picture is required"
  else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type))
    errors.student_id_pic = "Only JPG, PNG or PDF files are allowed"
  else if (file.size > 5 * 1024 * 1024)
    errors.student_id_pic = "File size must be less than 5MB"

  return errors
}

function Register() {
  const navigate = useNavigate()
  const [inputs, setInputs] = useState({
    email: '', password: '', fullname: '',
    student_id: '', university_name: '',
    phone: '', graduate_year: '',
  })
  const [file, setFile]       = useState(null)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
    const errs = validate(inputs, file)
    setErrors(prev => ({ ...prev, [e.target.name]: errs[e.target.name] || '' }))
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    setFile(f)
    setTouched(prev => ({ ...prev, student_id_pic: true }))
    if (f) {
      const errs = validate(inputs, f)
      setErrors(prev => ({ ...prev, student_id_pic: errs.student_id_pic || '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(inputs, file)
    setErrors(errs)
    setTouched({
      email: true, password: true, fullname: true,
      student_id: true, university_name: true,
      phone: true, graduate_year: true, student_id_pic: true
    })
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(inputs).forEach(([k, v]) => formData.append(k, v))
      formData.append('student_id_pic', file)

      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const user = res?.data?.user
      if (user?._id) {
        localStorage.setItem("userId", user._id)
        localStorage.setItem("ownerId", user._id)
        localStorage.setItem("user", JSON.stringify(user))
      }
      navigate('/')
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Registration failed. Please try again."
      setErrors(prev => ({ ...prev, submit: message }))
    } finally { setLoading(false) }
  }

  const getPasswordStrength = () => {
    const p = inputs.password
    if (!p) return null
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',   width: 'w-1/4' }
    if (score === 2) return { label: 'Fair',   color: 'bg-amber-400', width: 'w-2/4' }
    if (score === 3) return { label: 'Good',   color: 'bg-blue-400',  width: 'w-3/4' }
    return           { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
  }
  const strength = getPasswordStrength()

  const inputClass = (name) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 outline-none
    ${errors[name] && touched[name] 
      ? 'border-red-300 bg-red-50 focus:border-red-400' 
      : 'border-gray-100 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'}`

  const ErrorMsg = ({ name }) => errors[name] && touched[name]
    ? <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[name]}</p>
    : null

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* Left Side: Branding (Matches Login Theme) */}
      <div className="hidden md:flex md:w-1/2 bg-[#E6F4F1] items-center justify-center p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Join the community of <br />
            <span className="text-emerald-600">student earners.</span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Verify your identity once and unlock access to local opportunities tailored for your university life.
          </p>
          <div className="mt-8 flex gap-3">
             <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
             <div className="h-1 w-4 bg-emerald-200 rounded-full"></div>
             <div className="h-1 w-4 bg-emerald-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-800 text-center uppercase tracking-widest">Sign Up</h1>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-2 rounded-full"></div>
          </div>

          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg animate-pulse">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Full Name & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                <input type="text" name="fullname" placeholder="Samantha Sandaruwan"
                  onChange={handleChange} onBlur={handleBlur} className={inputClass('fullname')}/>
                <ErrorMsg name="fullname"/>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Student ID</label>
                <input type="text" name="student_id" placeholder="WJ38194520"
                  onChange={handleChange} onBlur={handleBlur} className={inputClass('student_id')}/>
                <ErrorMsg name="student_id"/>
              </div>
            </div>

            {/* Row 2: Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <input type="email" name="email" placeholder="email@university.edu"
                onChange={handleChange} onBlur={handleBlur} className={inputClass('email')}/>
              <ErrorMsg name="email"/>
            </div>

            {/* Row 3: Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••"
                  onChange={handleChange} onBlur={handleBlur} className={inputClass('password')}/>
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 text-xs font-semibold">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {strength && (
                <div className="px-1 pt-1">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strength.color} ${strength.width}`}/>
                  </div>
                </div>
              )}
              <ErrorMsg name="password"/>
            </div>

            {/* Row 4: University & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">University</label>
                <input type="text" name="university_name" placeholder="SLIIT / UoC"
                  onChange={handleChange} onBlur={handleBlur} className={inputClass('university_name')}/>
                <ErrorMsg name="university_name"/>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Graduation</label>
                <input type="number" name="graduate_year" placeholder="2026"
                  onChange={handleChange} onBlur={handleBlur} className={inputClass('graduate_year')}/>
                <ErrorMsg name="graduate_year"/>
              </div>
            </div>

            {/* Row 5: Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
              <input type="text" name="phone" placeholder="07xxxxxxxx"
                onChange={handleChange} onBlur={handleBlur} className={inputClass('phone')}/>
              <ErrorMsg name="phone"/>
            </div>

            {/* Row 6: File Upload (Simplified) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Verification Document (ID)</label>
              <div className={`group relative border-2 border-dashed rounded-lg p-4 transition-all
                ${errors.student_id_pic && touched.student_id_pic ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-emerald-400 hover:bg-emerald-50/30'}`}>
                <input type="file" name="student_id_pic" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
                <div className="text-center">
                  <p className={`text-xs ${file ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    {file ? `Selected: ${file.name}` : 'Click to upload Student ID (JPG, PNG, PDF)'}
                  </p>
                </div>
              </div>
              <ErrorMsg name="student_id_pic"/>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-lg text-sm transition-all shadow-lg shadow-emerald-200 uppercase tracking-widest">
                {loading ? 'Processing...' : 'Create Account'}
              </button>
              
              <p className="text-center text-gray-500 text-xs">
                Already have an account? 
                <button onClick={() => navigate('/login')} className="text-emerald-600 font-bold ml-1 hover:underline">
                  Sign In
                </button>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Register