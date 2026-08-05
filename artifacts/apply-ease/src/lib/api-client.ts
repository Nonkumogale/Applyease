// Mock data for development
const MOCK_DATA = {
  applications: [
    {
      id: "1",
      opportunity_id: "1",
      opportunity_title: "Google Summer Internship 2026",
      category: "internship",
      provider_name: "Google",
      status: "submitted",
      cover_letter: "Dear Google Selection Committee,\n\nI am excited to apply for the Summer Internship 2026 at Google...",
      application_link: "https://careers.google.com",
      submitted_date: "2026-08-01",
      document_checklist: [
        { label: "ID / Passport", checked: true },
        { label: "Latest results / transcript", checked: true },
        { label: "CV / Resume", checked: true },
        { label: "Cover letter", checked: true },
      ]
    },
    {
      id: "2",
      opportunity_id: "2",
      opportunity_title: "Microsoft Scholarship Program 2026",
      category: "scholarship",
      provider_name: "Microsoft",
      status: "draft",
      cover_letter: "",
      application_link: "https://www.microsoft.com/scholarships",
      document_checklist: [
        { label: "ID / Passport", checked: false },
        { label: "Latest results / transcript", checked: false },
        { label: "CV / Resume", checked: false },
        { label: "Cover letter", checked: false },
      ]
    }
  ],
  opportunities: [
    {
      id: "1",
      title: "Google Summer Internship 2026",
      category: "internship",
      provider_name: "Google",
      provider_email: "internships@google.com",
      description: "Join Google for a summer of innovation and learning. Work on real-world projects with world-class engineers.",
      requirements: "Currently enrolled in a Bachelor's or Master's program. Strong programming skills.",
      application_link: "https://careers.google.com/internships",
      deadline: "2026-12-31",
      location: "Mountain View, CA",
      amount: "$8,000/month",
      status: "open"
    },
    {
      id: "2",
      title: "Microsoft Scholarship Program 2026",
      category: "scholarship",
      provider_name: "Microsoft",
      provider_email: "scholarships@microsoft.com",
      description: "Full tuition scholarship for outstanding computer science students.",
      requirements: "GPA 3.5+, pursuing CS degree, demonstrated leadership.",
      application_link: "https://www.microsoft.com/scholarships",
      deadline: "2026-11-15",
      location: "Redmond, WA",
      amount: "Full tuition + stipend",
      status: "open"
    },
    {
      id: "3",
      title: "Apple Bursary Program 2026",
      category: "bursary",
      provider_name: "Apple",
      provider_email: "bursary@apple.com",
      description: "Financial aid for underprivileged students pursuing technology degrees.",
      requirements: "South African citizen, demonstrated financial need, pursuing STEM degree.",
      application_link: "https://www.apple.com/education/bursary",
      deadline: "2026-10-01",
      location: "Cape Town, SA",
      amount: "R50,000",
      status: "open"
    },
    {
      id: "4",
      title: "Stanford University Application 2026",
      category: "university",
      provider_name: "Stanford University",
      provider_email: "admissions@stanford.edu",
      description: "Apply to one of the world's leading universities.",
      requirements: "High school diploma, SAT/ACT scores, essays, letters of recommendation.",
      application_link: "https://www.stanford.edu/admissions",
      deadline: "2026-09-30",
      location: "Stanford, CA",
      amount: "Varies",
      status: "open"
    }
  ],
  profile: {
    id: "1",
    full_name: "Nolwazi",
    email: "nonkumogale47@gmail.com",
    phone: "+27 82 123 4567",
    id_number: "1234567890123",
    date_of_birth: "2000-01-01",
    education_level: "university",
    field_of_study: "Computer Science",
    institution: "University of Cape Town",
    year_of_study: "3rd year",
    gpa: "75%",
    address: "Cape Town, South Africa",
    bio: "Passionate about technology and education.",
    documents: [
      { name: "CV_2026.pdf", file_url: "/mock/cv.pdf", type: "Cv" },
      { name: "Transcript.pdf", file_url: "/mock/transcript.pdf", type: "results" },
      { name: "ID_Document.pdf", file_url: "/mock/id.pdf", type: "ID" }
    ]
  },
  currentUser: {
    id: "1",
    email: "nonkumogale47@gmail.com",
    full_name: "Nolwazi",
    role: "user"
  }
};

// API Client with mock data fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK = true; // Set to false when you have a real backend

export const apiClient = {
  get: async <T = any>(endpoint: string): Promise<T> => {
    if (USE_MOCK) {
      console.log(`🔵 [MOCK] GET ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Return mock data based on endpoint
      if (endpoint.includes('/auth/me')) {
        return MOCK_DATA.currentUser as T;
      }
      if (endpoint.includes('/applications')) {
        return MOCK_DATA.applications as T;
      }
      if (endpoint.includes('/opportunities')) {
        if (endpoint.includes('/')) {
          const id = endpoint.split('/').pop();
          const opp = MOCK_DATA.opportunities.find(o => o.id === id);
          return (opp || MOCK_DATA.opportunities[0]) as T;
        }
        return MOCK_DATA.opportunities as T;
      }
      if (endpoint.includes('/profiles')) {
        return MOCK_DATA.profile as T;
      }
      if (endpoint.includes('/email/send')) {
        return { success: true } as T;
      }
      return [] as T;
    }

    // Real API call
    const token = localStorage.getItem('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  post: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    if (USE_MOCK) {
      console.log(`🔵 [MOCK] POST ${endpoint}`, data);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Handle login
      if (endpoint.includes('/auth/login')) {
        if (data.email && data.password) {
          localStorage.setItem('access_token', 'mock-token-12345');
          return { 
            user: MOCK_DATA.currentUser, 
            token: 'mock-token-12345' 
          } as T;
        }
        throw new Error('Invalid credentials');
      }
      
      // Handle registration
      if (endpoint.includes('/auth/register')) {
        return { 
          user: { ...MOCK_DATA.currentUser, email: data.email, full_name: data.full_name || "New User" },
          message: "Registration successful"
        } as T;
      }
      
      // Handle verification
      if (endpoint.includes('/auth/verify-otp')) {
        return { access_token: 'mock-token-12345', user: MOCK_DATA.currentUser } as T;
      }
      
      // Handle resend OTP
      if (endpoint.includes('/auth/resend-otp')) {
        return { message: "OTP sent successfully" } as T;
      }
      
      // Handle forgot password
      if (endpoint.includes('/auth/forgot-password')) {
        return { message: "Password reset email sent" } as T;
      }
      
      // Handle reset password
      if (endpoint.includes('/auth/reset-password')) {
        return { message: "Password reset successful" } as T;
      }
      
      // Handle email sending
      if (endpoint.includes('/email/send')) {
        return { success: true } as T;
      }
      
      // Handle application creation
      if (endpoint.includes('/applications')) {
        const newApp = { ...data, id: Date.now().toString() };
        MOCK_DATA.applications.push(newApp);
        return newApp as T;
      }
      
      // Handle opportunity creation
      if (endpoint.includes('/opportunities')) {
        const newOpp = { ...data, id: Date.now().toString() };
        MOCK_DATA.opportunities.push(newOpp);
        return newOpp as T;
      }
      
      // Handle profile creation/update
      if (endpoint.includes('/profiles')) {
        return { ...MOCK_DATA.profile, ...data } as T;
      }
      
      return { success: true } as T;
    }

    // Real API call
    const token = localStorage.getItem('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  put: async <T = any>(endpoint: string, data: any): Promise<T> => {
    if (USE_MOCK) {
      console.log(`🔵 [MOCK] PUT ${endpoint}`, data);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, ...data } as T;
    }
    
    const token = localStorage.getItem('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    if (USE_MOCK) {
      console.log(`🔵 [MOCK] DELETE ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true } as T;
    }
    
    const token = localStorage.getItem('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },
};
