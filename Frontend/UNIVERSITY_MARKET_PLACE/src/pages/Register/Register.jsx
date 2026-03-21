import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
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

  // Password strength indicator
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
    return           { label: 'Strong', color: 'bg-green-400', width: 'w-full' }
  }
  const strength = getPasswordStrength()

  const inputClass = (name) =>
    `border-b-2 ${errors[name] && touched[name] ? 'border-red-400' : 'border-purple-200 focus:border-cyan-500'} outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200 bg-transparent w-full`

  const ErrorMsg = ({ name }) => errors[name] && touched[name]
    ? <p className="text-red-500 text-xs mt-1 flex items-center gap-1">{errors[name]}</p>
    : null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-1">University Marketplace</p>
          <h1 className="text-4xl font-black text-purple-950">Create Account</h1>
          <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full mx-auto"></div>
          <p className="text-gray-400 text-sm mt-3">Register with your university credentials to get started</p>
        </div>

        {/* Form card */}
        <div className="border-l-4 border-purple-950 bg-white shadow-xl rounded-2xl p-8">

          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
             {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">

            {/* Email */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Email</label>
              <input type="email" name="email" placeholder="samantha.MN64933@uoc.edu"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('email')}/>
              <ErrorMsg name="email"/>
            </div>

            {/* Password */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••"
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('password') + ' pr-10'}/>
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-950 text-sm transition-colors">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Password strength */}
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Strength: <span className="font-semibold text-gray-600">{strength.label}</span>
                  </p>
                </div>
              )}
              <ErrorMsg name="password"/>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Full Name</label>
              <input type="text" name="fullname" placeholder="Samantha Amaraseka"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('fullname')}/>
              <ErrorMsg name="fullname"/>
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID</label>
              <input type="text" name="student_id" placeholder="BM6382538"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('student_id')}/>
              <ErrorMsg name="student_id"/>
            </div>

            {/* University */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">University</label>
              <input type="text" name="university_name" placeholder="University of Colombo, SLIIT"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('university_name')}/>
              <ErrorMsg name="university_name"/>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Phone</label>
              <input type="text" name="phone" placeholder="0771234567"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('phone')}/>
              <ErrorMsg name="phone"/>
            </div>

            {/* Graduate Year */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Graduate Year</label>
              <input type="number" name="graduate_year" placeholder="2026"
                min="2020" max="2035"
                onChange={handleChange} onBlur={handleBlur}
                className={inputClass('graduate_year')}/>
              <ErrorMsg name="graduate_year"/>
            </div>

            {/* File upload */}
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID Picture</label>
              <div className={`border-2 border-dashed rounded-xl px-4 py-4 transition-all duration-200
                ${errors.student_id_pic && touched.student_id_pic ? 'border-red-400 bg-red-50' : 'border-purple-200 hover:border-cyan-500'}`}>
                <input type="file" name="student_id_pic" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="text-black text-sm w-full"/>
                {file ? (
                  <p className="text-green-600 text-xs mt-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">Accepts jpg, jpeg, png, pdf · Max 5MB</p>
                )}
              </div>
              <ErrorMsg name="student_id_pic"/>
            </div>

            {/* Submit */}
            <div className="col-span-2">
              <button type="submit" disabled={loading}
                className="w-full bg-purple-950 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Registering…
                  </>
                ) : 'Register Now →'}
              </button>
            </div>

            {/* Login link */}
            <div className="col-span-2 text-center">
              <p className="text-gray-400 text-sm">Already have an account?
                <span onClick={() => navigate('/login')}
                  className="text-cyan-500 font-bold ml-1 cursor-pointer hover:text-purple-950 transition-all duration-200">
                  Login here
                </span>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Register