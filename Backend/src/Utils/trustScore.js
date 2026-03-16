// Backend2/Utils/trustScore.js

// ── Government Universities (UGC) ─────────────────────────
const GOV_UNIVERSITIES = [
  "university of colombo",
  "university of peradeniya",
  "university of sri jayewardenepura",
  "university of kelaniya",
  "university of moratuwa",
  "university of jaffna",
  "university of ruhuna",
  "eastern university",
  "south eastern university",
  "rajarata university",

  "sabaragamuwa university",
  "wayamba university",
  "uva wellassa university",
  "university of the visual and performing arts",
  "university of the visual & performing arts",
  "gampaha wickramarachchi university",
  "sri lanka technological campus",
  "open university of sri lanka",
  "buddhist and pali university",
]

// ── Semi-Government / Special Universities ────────────────
const SEMI_GOV_UNIVERSITIES = [
  "sri lanka institute of information technology", "sliit",
  "kotelawala defence university", "general sir john kotelawala","kdu",
  "sri lanka military academy",
  "ocean university of sri lanka",
  "sri lanka institute of development administration", "slida",
  "postgraduate institute of medicine", "pgim",
  "postgraduate institute of agriculture", "pgia",
  "postgraduate institute of science", "pgis",
  "institute of indigenous medicine",
  "national institute of education", "nie",
  "sri lanka institute of nanotechnology", "slintec",
]

// ── Private Universities & Degree-Awarding Institutes ─────
const PRIVATE_UNIVERSITIES = [
  "nsbm green university",
  "informatics institute of technology", "iit",
  "american national college", "anc",
  "asia pacific institute of information technology", "apiit",
  "bhikkhu university",
  "cinec campus",
  "colombo international nautical",
  "esoft metro campus",
  "horizon campus",
  "icbt campus",
  "international college of business and technology", "icbt",
  "java institute",
  "northwestern university",
  "sri lanka institute of marketing", "slim",
  "win campus",
  "acbt",
  "sbm college",
  "institute of chartered accountants", "ca sri lanka",
  "cpa australia",
  "aat",
  "pearson",
  "nawaloka college",
  "metropolitan college",
  "aquinas college",
  "charter institute",
  "colombo school of construction technology",
]

// ── University Email Domains ──────────────────────────────
const UNI_EMAIL_DOMAINS = [
  // Government
  "cmb.ac.lk", "pdn.ac.lk", "sjp.ac.lk", "kln.ac.lk",
  "uom.lk", "jfn.ac.lk", "ruh.ac.lk", "esn.ac.lk",
  "seu.ac.lk", "rjt.ac.lk", "sab.ac.lk", "wyb.ac.lk",
  "uvawellassa.ac.lk", "vpa.ac.lk", "gwu.ac.lk",
  "sltc.ac.lk", "ou.ac.lk", "bpu.ac.lk",
  // Semi-gov
  "sliit.lk", "kdu.ac.lk", "ocean.ac.lk",
  "pgim.ac.lk", "pgia.ac.lk", "pgis.ac.lk",
  // Private
  "nsbm.edu.lk", "iit.ac.lk", "apiit.lk",
  "cinec.edu", "horizoncampus.edu.lk", "icbt.lk",
  "javainstitute.edu.lk", "esoft.lk",
]

// ── Scoring ───────────────────────────────────────────────
const matchesUni = (input, list) => {
  if (!input) return false
  const lower = input.toLowerCase().trim()
  return list.some(u => lower.includes(u) || u.includes(lower))
}

export const calculateTrustScore = (user) => {
  let score = 0
  const breakdown = {}


// 1. Email domain (15 pts)
const emailDomain = user.email?.split("@")[1]?.toLowerCase()

if (UNI_EMAIL_DOMAINS.includes(emailDomain)) {
  score += 15
  breakdown.emailDomain = { pts: 15, note: "✅ Recognized university email domain" }
} else if (emailDomain === "gmail.com") {
  score += 10
  breakdown.emailDomain = { pts: 10, note: "📧 Personal Gmail (common among students)" }
} else {
  score += 0
  breakdown.emailDomain = { pts: 0, note: "❌ Unrecognized email provider (yahoo/hotmail etc)" }
}

  // 2. Student ID format (25 pts)
  const idRegex = /^[A-Z]{1,5}\d{2}[A-Z]?\d{2,4}$/
  if (user.student_id && idRegex.test(user.student_id.toUpperCase())) {
    score += 25
    breakdown.studentId = { pts: 25, note: "✅ Valid student ID format" }
  } else {
    breakdown.studentId = { pts: 0, note: "❌ Unrecognized ID format (expected e.g. IT22A001)" }
  }

  // 3. University name — tiered scoring (25 pts max)
  const uniName = user.university_name
  if (matchesUni(uniName, GOV_UNIVERSITIES)) {
    score += 25
    breakdown.universityName = { pts: 25, note: "✅ Government university (UGC recognized)" }
  } else if (matchesUni(uniName, SEMI_GOV_UNIVERSITIES)) {
    score += 20
    breakdown.universityName = { pts: 20, note: "✅ Semi-government / special university" }
  } else if (matchesUni(uniName, PRIVATE_UNIVERSITIES)) {
    score += 15
    breakdown.universityName = { pts: 15, note: "✅ Recognized private university" }
  } else {
    breakdown.universityName = { pts: 0, note: "❌ University not in recognized list" }
  }

  // 4. Profile completeness (20 pts)
  let completeness = 0
  if (user.fullname)        completeness += 4
  if (user.phone)           completeness += 4
  if (user.graduate_year)   completeness += 4
  if (user.university_name) completeness += 4
  if (user.student_id)      completeness += 4
  score += completeness
  breakdown.completeness = { pts: completeness, note: `Profile completeness` }

  // 5. ID picture uploaded (5 pts)
  if (user.student_id_pic && user.student_id_pic !== "") {
    score += 5
    breakdown.idPicUploaded = { pts: 5, note: "✅ Student ID picture uploaded" }
  } else {
    breakdown.idPicUploaded = { pts: 0, note: "❌ No ID picture uploaded" }
  }

  // 6. Account age (10 pts)
  const ageInDays = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
  const agePts = Math.min(10, Math.floor(ageInDays / 3))
  score += agePts
  breakdown.accountAge = { pts: agePts, note: `Account is ${Math.floor(ageInDays)} days old` }

  return { score: Math.min(100, score), breakdown }
}