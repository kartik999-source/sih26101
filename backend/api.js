const express = require("express");
const db = require("./db");
const auth = require("./auth");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge-secret-key-2026";

function registerApiRoutes(app) {
  /* ================= MIDDLEWARE ================= */
  app.use(express.json());

  /* ================= HEALTH & DB STATUS ================= */
  app.get("/api/health", async (req, res) => {
    const dbStatus = await db.checkDatabaseConnection();
    res.json({
      status: "online",
      service: "Ladder AI Backend",
      version: "1.0.0",
      database: {
        ...dbStatus
      }
    });
  });

  app.get("/api/database/users", async (req, res) => {
    try {
      const pgUsers = await db.query(
        "SELECT id, name, email, role, student_id, mentor_id, company_id, created_at FROM users ORDER BY id ASC"
      );
      return res.json({
        success: true,
        database: "PostgreSQL",
        count: pgUsers.rows.length,
        users: pgUsers.rows
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to read database users", details: err.message });
    }
  });

  /* =========== AUTHENTICATION ROUTES ========== */
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role = "student", extraInfo } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userName = name || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    try {
      const result = await db.registerUser({ name: userName, email: cleanEmail, password, role, extraInfo });
      return res.status(201).json(result);
    } catch (error) {
      // If user already exists, check if password matches for seamless sign-in
      if (error.message.includes("already exists")) {
        try {
          const loginRes = await db.loginUser({ email: cleanEmail, password });
          return res.json({
            ...loginRes,
            message: "Welcome back! Signed in to your existing account."
          });
        } catch (loginErr) {
          return res.status(400).json({
            error: "An account with this email already exists. Please enter the correct password to sign in.",
            code: "USER_EXISTS"
          });
        }
      }
      return res.status(400).json({ error: error.message, code: "REGISTER_ERROR" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password, autoRegister } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      const result = await db.loginUser({ email: cleanEmail, password });
      return res.json(result);
    } catch (error) {
      // If account not found and autoRegister is enabled (or user requested instant access), register them smoothly
      if (error.message.includes("No account found") && autoRegister) {
        try {
          const defaultName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const result = await db.registerUser({
            name: defaultName || "Student Member",
            email: cleanEmail,
            password,
            role: "student"
          });
          return res.status(201).json({
            ...result,
            message: "Account created and logged in successfully."
          });
        } catch (regErr) {
          return res.status(400).json({ error: regErr.message, code: "REGISTER_ERROR" });
        }
      }

      const statusCode = error.message.includes("No account found") || error.message.includes("Invalid email") ? 401 : 400;
      return res.status(statusCode).json({
        error: error.message,
        code: error.message.includes("No account found") ? "USER_NOT_FOUND" : "INVALID_CREDENTIALS"
      });
    }
  });

  /* ================= OAUTH ROUTES ================= */
  app.get("/api/auth/url", auth.handleAuthUrl);
  app.get("/api/auth/callback", auth.handleAuthCallback);
  app.get("/api/auth/status/:platform", auth.handleAuthStatus);
  app.post("/api/auth/disconnect/:platform", auth.handleDisconnect);

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    jwt.verify(token, JWT_SECRET, async (error, decoded) => {
      if (error) {
        return res.status(403).json({ error: "Token invalid or expired" });
      }
      
      try {
        const user = db.getUserById(decoded.userId);
        if (user) {
          return res.json({ user });
        }
        return res.status(404).json({ error: "User not found" });
      } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
      }
    });
  });

  /* ================= STUDENT ================= */
  app.get("/api/student", async (req, res) => {
    try {
      const result = await db.query(
        "SELECT id, name, course, batch, target_role, career_readiness, experience_score FROM students ORDER BY id ASC LIMIT 1"
      );
      if (result && result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          id: row.id,
          name: row.name,
          course: row.course,
          batch: row.batch,
          targetRole: row.target_role,
          careerReadiness: row.career_readiness,
          experienceScore: row.experience_score
        });
      }
    } catch (err) {
      console.warn("DB query notice in /api/student:", err.message);
    }

    res.json({
      id: 1,
      name: "Adarsh Pratap Singh",
      course: "CSIT",
      batch: "2025-29",
      targetRole: "Full Stack Software Engineer",
      careerReadiness: 81,
      experienceScore: 64
    });
  });

  /* ================= MENTORS ================= */
  app.get("/api/mentors", async (req, res) => {
    try {
      const result = await db.query(
        "SELECT id, name, role, company, experience_years, availability FROM mentors ORDER BY id ASC"
      );
      if (result && result.rows && result.rows.length > 0) {
        const mapped = result.rows.map((m, idx) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          company: m.company,
          experience: m.experience_years,
          match: 94 - idx * 3,
          availability: m.availability
        }));
        return res.json(mapped);
      }
    } catch (err) {
      console.warn("DB query notice in /api/mentors:", err.message);
    }

    res.json([
      { id: 1, name: "Rohan Mehta", role: "Senior Software Architect", company: "TechNova Labs", experience: 12, match: 94, availability: true },
      { id: 2, name: "Priya Sharma", role: "Engineering Manager", company: "CloudSphere", experience: 10, match: 91, availability: true },
      { id: 3, name: "Arjun Kapoor", role: "AI/ML Lead", company: "DataSphere AI", experience: 14, match: 88, availability: true }
    ]);
  });

  /* ================= BEST MENTOR ================= */
  app.get("/api/mentors/best-match", async (req, res) => {
    try {
      const result = await db.query(
        "SELECT id, name, role, company, experience_years, availability FROM mentors ORDER BY experience_years DESC LIMIT 1"
      );
      if (result && result.rows && result.rows.length > 0) {
        const m = result.rows[0];
        return res.json({
          id: m.id,
          name: m.name,
          role: m.role,
          company: m.company,
          experience: m.experience_years,
          match: 94
        });
      }
    } catch (err) {
      console.warn("DB query notice in /api/mentors/best-match:", err.message);
    }

    res.json({
      id: 1,
      name: "Rohan Mehta",
      role: "Senior Software Architect",
      company: "TechNova Labs",
      experience: 12,
      match: 94
    });
  });

  app.post("/api/mentors", (req, res) => {
    const { name, role, company, experience_years, experience, availability } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Mentor name is required" });
    }

    try {
      const mentor = db.createMentor({
        name,
        role,
        company,
        experience: experience || experience_years,
        availability
      });
      return res.status(201).json({ success: true, mentor });
    } catch (err) {
      console.error("DB insert error in /api/mentors:", err.message);
      res.status(500).json({ error: "Failed to create mentor", details: err.message });
    }
  });

  /* ================= GIGS ================= */
  app.get("/api/gigs", (req, res) => {
    try {
      const gigs = db.getGigs();
      return res.json(gigs);
    } catch (err) {
      console.error("Error in /api/gigs:", err.message);
      res.status(500).json({ error: "Failed to fetch gigs" });
    }
  });

  /* ================= POST NEW GIG ================= */
  app.post("/api/gigs", (req, res) => {
    const { title, requiredSkill, skill, hours, payment, description, companyId, company } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Gig title is required" });
    }

    try {
      const newGig = db.createGig({
        title,
        requiredSkill: requiredSkill || skill,
        hours,
        payment,
        description,
        company,
        companyId
      });
      return res.status(201).json({
        success: true,
        gig: newGig
      });
    } catch (err) {
      console.error("DB insert error in /api/gigs:", err.message);
      res.status(500).json({ error: "Failed to add gig", details: err.message });
    }
  });

  /* ================= JOBS ================= */
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await db.getJobs();
      res.json(jobs);
    } catch (err) {
      console.error("Error in GET /api/jobs:", err.message);
      res.status(500).json({ error: "Failed to fetch job postings" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await db.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      res.json(job);
    } catch (err) {
      console.error("Error in GET /api/jobs/:id:", err.message);
      res.status(500).json({ error: "Failed to fetch job details" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    const { 
      title, 
      company, 
      companyId, 
      location, 
      type, 
      jobType,
      duration, 
      stipend, 
      salary,
      openings, 
      requiredSkills, 
      skills,
      eligibility, 
      description, 
      deadline, 
      status 
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    try {
      const newJob = await db.createJob({
        title,
        company: company || "Enterprise Partner",
        companyId: companyId || 1,
        location: location || "Remote",
        type: type || jobType || "Full-Time",
        duration: duration || "6 Months",
        stipend: stipend || salary || "Competitive",
        openings: openings || 1,
        requiredSkills: requiredSkills || skills || ["Engineering"],
        eligibility: eligibility || "All Qualified Students",
        description: description || "Job opening posted by partner recruiter.",
        deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: status || "Active"
      });

      return res.status(201).json({
        success: true,
        job: newJob,
        message: "Job posting created and saved to database successfully."
      });
    } catch (err) {
      console.error("DB insert error in POST /api/jobs:", err.message);
      res.status(500).json({ error: "Failed to create job posting", details: err.message });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const updated = await db.updateJob(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      return res.json({
        success: true,
        job: updated,
        message: "Job posting updated successfully in database."
      });
    } catch (err) {
      console.error("DB update error in PUT /api/jobs/:id:", err.message);
      res.status(500).json({ error: "Failed to update job posting", details: err.message });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await db.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      return res.json({
        success: true,
        message: "Job posting removed from database."
      });
    } catch (err) {
      console.error("DB delete error in DELETE /api/jobs/:id:", err.message);
      res.status(500).json({ error: "Failed to delete job posting", details: err.message });
    }
  });

  /* ================= APPLY GIG ================= */
  app.post("/api/gigs/apply", (req, res) => {
    const { studentId, gigId, message, githubRepo } = req.body;

    if (!gigId) {
      return res.status(400).json({
        error: "gigId is required"
      });
    }

    try {
      const application = db.applyForGig({
        studentId: studentId || 1,
        gigId,
        message,
        githubRepo
      });
      return res.status(201).json({
        success: true,
        application,
        message: "Application submitted and recorded in database"
      });
    } catch (err) {
      console.error("DB insert error in /api/gigs/apply:", err.message);
      res.status(500).json({ error: "Failed to apply for gig", details: err.message });
    }
  });

  /* ================= MENTOR BOOKING ================= */
  app.post("/api/mentors/book", (req, res) => {
    const { studentId, mentorId, date, time, topic } = req.body;

    if (!mentorId || !time) {
      return res.status(400).json({
        error: "Complete booking information is required"
      });
    }

    try {
      const booking = db.bookMentorSession({
        studentId: studentId || 1,
        mentorId,
        date,
        time,
        topic
      });
      return res.status(201).json({
        success: true,
        booking,
        message: "15-Minute Capsule booked successfully"
      });
    } catch (err) {
      console.error("DB insert error in /api/mentors/book:", err.message);
      res.status(500).json({ error: "Failed to book mentor session", details: err.message });
    }
  });

  /* ================= EXPERIENCE PASSPORT ================= */
  app.get("/api/passport", (req, res) => {
    try {
      const studentId = req.query.studentId;
      const records = db.getPassportRecords(studentId);
      return res.json(records);
    } catch (err) {
      console.error("Error in /api/passport:", err.message);
      res.status(500).json({ error: "Failed to fetch passport records" });
    }
  });

  app.post("/api/passport/mint", (req, res) => {
    try {
      const { studentId, title, company, score, skillsVerified } = req.body;
      const record = db.mintPassportRecord({ studentId, title, company, score, skillsVerified });
      return res.status(201).json({ success: true, record });
    } catch (err) {
      console.error("Error in /api/passport/mint:", err.message);
      res.status(500).json({ error: "Failed to mint passport record" });
    }
  });

  /* ================= GHOST INTERNSHIP TASKS ================= */
  app.get("/api/ghost-tasks", (req, res) => {
    try {
      const tasks = db.getGhostTasks();
      return res.json(tasks);
    } catch (err) {
      console.error("Error in /api/ghost-tasks:", err.message);
      res.status(500).json({ error: "Failed to fetch ghost tasks" });
    }
  });

  /* ================= FACULTY MOUS & SWAPS ================= */
  app.get("/api/faculty/mous", (req, res) => {
    try {
      const mous = db.getMouRequests();
      return res.json(mous);
    } catch (err) {
      console.error("Error in /api/faculty/mous:", err.message);
      res.status(500).json({ error: "Failed to fetch MOUs" });
    }
  });

  app.post("/api/faculty/mous", (req, res) => {
    try {
      const mou = db.createMouRequest(req.body);
      return res.status(201).json({ success: true, mou });
    } catch (err) {
      console.error("Error in /api/faculty/mous POST:", err.message);
      res.status(500).json({ error: "Failed to create MOU" });
    }
  });

  app.get("/api/faculty/swaps", (req, res) => {
    try {
      const swaps = db.getFacultySwaps();
      return res.json(swaps);
    } catch (err) {
      console.error("Error in /api/faculty/swaps:", err.message);
      res.status(500).json({ error: "Failed to fetch faculty swaps" });
    }
  });

  app.post("/api/faculty/swaps", (req, res) => {
    try {
      const swap = db.createFacultySwap(req.body);
      return res.status(201).json({ success: true, swap });
    } catch (err) {
      console.error("Error in /api/faculty/swaps POST:", err.message);
      res.status(500).json({ error: "Failed to create faculty swap" });
    }
  });

  app.get("/api/faqs", (req, res) => {
    try {
      const faqs = db.getFaqs();
      return res.json(faqs);
    } catch (err) {
      console.error("Error in /api/faqs:", err.message);
      res.status(500).json({ error: "Failed to fetch faqs" });
    }
  });

  /* ================= SKILL INTELLIGENCE (iGOT Integration) ================= */
  app.get("/api/ai/igot/recommendations", (req, res) => {
    const { profession, skills } = req.query;
    
    // Simple dynamic mapping logic
    let recommendations = [];
    if (profession === 'Software Developer') {
        recommendations = [
            { id: 1, title: "Cloud Computing Fundamentals", provider: "iGOT Karmayogi", category: "Technical", level: "Intermediate", duration: "10h" },
            { id: 2, title: "AI/ML for Developers", provider: "iGOT Karmayogi", category: "Technical", level: "Advanced", duration: "15h" }
        ];
    } else {
        recommendations = [
            { id: 3, title: "Public Governance Basics", provider: "iGOT Karmayogi", category: "Digital Governance", level: "Beginner", duration: "5h" }
        ];
    }
    
    res.json({ recommendations });
  });

  app.post("/api/ai/igot/progress", (req, res) => {
    const { courseId, progress } = req.body;
    console.log(`Updating progress for course ${courseId} to ${progress}%`);
    res.json({ success: true });
  });

  app.post("/api/ai/quiz/generate", async (req, res) => {
    const { content } = req.body;
    const ai = getGenAiClient();
    if (!ai) return res.status(500).json({ error: "AI Client not initialized" });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: [{ role: "user", parts: [{ text: `Generate 3 MCQs with answers from this content: ${content}` }] }]
        });
        res.json({ quiz: response.text });
    } catch (err) {
        res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  /* ================= CAREER ANALYSIS ================= */
  app.get("/api/ai/career-analysis", (req, res) => {
    res.json({
      student: "Adarsh Pratap Singh",
      recommendedRole: "Full Stack Software Engineer",
      compatibility: 87,
      placementReadiness: 91,
      strongestSkill: "Git & Collaboration",
      priorityGap: "Backend Architecture",
      recommendation: [
        "Complete backend micro-gig",
        "Attend system design mentor capsule",
        "Deploy authenticated REST API"
      ]
    });
  });

  /* ================= SKILL GAP ================= */
  app.get("/api/ai/skill-gaps", (req, res) => {
    res.json({
      gaps: [
        {
          skill: "Backend Architecture",
          severity: "Critical",
          current: 42,
          required: 92
        },
        {
          skill: "REST API Design",
          severity: "High",
          current: 55,
          required: 86
        },
        {
          skill: "Database Optimization",
          severity: "Medium",
          current: 61,
          required: 88
        },
        {
          skill: "Cloud Deployment",
          severity: "Medium",
          current: 57,
          required: 78
        }
      ]
    });
  });

  /* ================= CHAT API (GEMINI POWERED) ================= */
  const { GoogleGenAI } = require("@google/genai");

  let genAiClient = null;
  function getGenAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!genAiClient && apiKey && typeof apiKey === "string" && apiKey.trim().length > 5) {
      try {
        genAiClient = new GoogleGenAI({ 
          apiKey: apiKey.trim(),
          httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
          }
        });
      } catch (e) {
        console.warn("Failed to initialize GoogleGenAI client:", e.message);
      }
    }
    return genAiClient;
  }

  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const ai = getGenAiClient();
    if (!ai) return res.status(500).json({ error: "AI Client not initialized" });

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
    const userMessage = messages[messages.length - 1].text;

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
          systemInstruction: "You are an AI Faculty Advisor. Answer concisely, directly, and provide actionable advice for HODs and Faculty.",
          thinkingConfig: { thinkingLevel: 'minimal' }
      },
      history
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const stream = await chat.sendMessageStream({ message: userMessage });
      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.end();
    } catch (e) {
      console.error("Chat error:", e);
      res.status(500).end();
    }
  });

  /* ================= AI HELP DESK & ADVISOR (GEMINI POWERED) ================= */
  app.post("/api/ai/helpdesk/chat", async (req, res) => {
    const { message, history = [], category = "general", studentProfile = {} } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const userQuery = message.trim();

    // Attempt Gemini API via @google/genai SDK
    const ai = getGenAiClient();
    if (ai) {
      try {
        const systemInstruction = `You are Bridge Buddy. Rules: 1) Answer in max 70 words 2) Direct code only 3) No intro 4) maxOutputTokens 350, temperature 0.2, topP 0.7, topK 15 5) Stream response with SSE 6) Show badge GEMINI 2.5 FLASH LITE LIVE ⚡ green pulse. For JWT Blacklist give Set code, for PostgreSQL indexing give CREATE INDEX CONCURRENTLY code, for SQL Pool give mysql2 pool 20 limit code. Never show 3 dots for more than 300ms. Start streaming within 400ms.`;

        const contents = [];
        if (Array.isArray(history) && history.length > 0) {
          const recent = history.slice(-6);
          for (const msg of recent) {
            if (msg.sender === "user") {
              contents.push({ role: "user", parts: [{ text: msg.text }] });
            } else if (msg.sender === "ai" || msg.sender === "assistant") {
              contents.push({ role: "model", parts: [{ text: msg.text }] });
            }
          }
        }
        contents.push({ role: "user", parts: [{ text: userQuery }] });

        let replyText = null;
        const candidateModels = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite-preview-02-05", "gemini-1.5-flash-8b", "gemini-2.0-flash"];
        for (const modelName of candidateModels) {
          try {
            if (req.query.stream === 'true') {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Transfer-Encoding', 'chunked');

              const responseStream = await ai.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.2,
                  maxOutputTokens: 350,
                  topP: 0.7,
                  topK: 15,
                  safetySettings: []
                }
              });
              for await (const chunk of responseStream) {
                if (chunk && chunk.text) {
                  res.write(chunk.text);
                }
              }
              res.end();
              return;
            }

            const response = await ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                temperature: 0.2,
                maxOutputTokens: 350,
                topP: 0.7,
                topK: 15,
                safetySettings: []
              }
            });

            if (response && response.text) {
              replyText = response.text.trim();
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} unavailable, trying next model...`);
          }
        }

        if (replyText) {
          return res.json({
            reply: replyText,
            suggestions: [
              "What is the next step to practice this?",
              "Can you provide a code example for this?",
              "How do I review this with my mentor?"
            ],
            source: "gemini",
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini Help Desk request failed");
      }
    }
  });

  /* ================= GET AI HELPDESK FAQS ================= */
  app.get("/api/ai/helpdesk/faq", (req, res) => {
    res.json({
      categories: [
        { id: "all", label: "All Topics", icon: "🌐" },
        { id: "gigs", label: "Micro-Internships", icon: "💼" },
        { id: "technical", label: "Technical & Coding", icon: "💻" },
        { id: "mentorship", label: "Mentor Capsules", icon: "🎓" },
        { id: "career", label: "Career & Readiness", icon: "🚀" }
      ],
      faqs: [
        {
          id: 1,
          category: "gigs",
          question: "How do I get paid and earn verified credit for micro-internships?",
          answer: "When you complete an industry gig, your pull request and deliverable are reviewed by the partner company. Upon approval, payment is credited to your linked payout account and a verified badge is minted directly to your Experience Passport."
        },
        {
          id: 2,
          category: "technical",
          question: "What should I do if my PostgreSQL connection times out or fails?",
          answer: "Verify your connection string syntax, ensure cloud SSL is configured with `{ rejectUnauthorized: false }`, and verify that your IP is whitelisted if using a hosted instance like Cloud SQL or Neon."
        },
        {
          id: 3,
          category: "mentorship",
          question: "How do 15-minute capsule mentorship sessions work?",
          answer: "Capsules are laser-focused 1-on-1 sprint sessions designed for targeted code review, architecture feedback, or placement strategy. Come prepared with 2-3 specific questions and your repository ready for screen sharing."
        },
        {
          id: 4,
          category: "career",
          question: "How is my Career Readiness score calculated?",
          answer: "The AI Career Twin analyzes your verified gig completions (40%), mentorship capsule reviews (25%), technical assessment score (20%), and profile activity (15%) to benchmark your percentile against actual industry hiring bars."
        },
        {
          id: 5,
          category: "technical",
          question: "How do I resolve JWT TokenExpiredError in full-stack apps?",
          answer: "Implement a refresh token flow or re-authenticate the user on 401 responses. Make sure client requests check `localStorage` validity before making API calls."
        }
      ]
    });
  });

  /* ================= POST CREATE HELPDESK TICKET ================= */
  app.post("/api/ai/helpdesk/ticket", async (req, res) => {
    const { title, category, description, priority = "medium", studentId = 1 } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    try {
      const result = await db.query(
        `INSERT INTO helpdesk_tickets (student_id, category, title, description, priority, status, ai_summary)
         VALUES ($1, $2, $3, $4, $5, 'open', 'Diagnostic pending...')
         RETURNING id, student_id, category, title, description, priority, status, ai_summary, created_at`,
        [studentId, category || "general", title, description, priority.toLowerCase()]
      );

      if (result && result.rows && result.rows.length > 0) {
        return res.status(201).json({
          success: true,
          ticket: result.rows[0],
          message: "Ticket created"
        });
      }
    } catch (err) {
      console.error("DB error creating ticket:", err.message);
    }

    res.status(201).json({
      success: true,
      ticket: {
        id: Date.now(),
        student_id: studentId,
        title,
        category: category || "general",
        description,
        priority: priority.toLowerCase(),
        status: "open",
        ai_summary: "Pending diagnostic...",
        created_at: new Date().toISOString()
      },
      message: "Ticket created"
    });
  });

  /* ================= GET HELPDESK TICKETS ================= */
  app.get("/api/ai/helpdesk/tickets", async (req, res) => {
    try {
      const result = await db.query(
        "SELECT id, student_id, category, title, description, priority, status, ai_summary, created_at FROM helpdesk_tickets ORDER BY id DESC"
      );
      if (result && result.rows) {
        return res.json(result.rows);
      }
    } catch (err) {
      console.warn("DB query notice in /api/ai/helpdesk/tickets:", err.message);
    }
    res.json([]);
  });

  /* ================= API 404 HANDLER ================= */
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
  });
}

module.exports = { registerApiRoutes };
