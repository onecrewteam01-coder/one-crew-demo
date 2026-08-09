require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const path = require('path'); // Core Node module to handle clean file paths
const { createClient } = require('@supabase/supabase-js'); // Destructured client import

const verifyToken = require('./middleware/authMiddleware'); 
const discoveryRoutes = require('./routes/discoveryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orchestratorRoutes = require('./routes/orchestratorRoutes');

const { generateWorkspace } = require('../ai/workspace/index.js');

// 1. INITIALIZE APP FIRST
const app = express();
const PORT = process.env.PORT || 5000; 

// Mock a global WebSocket class to bypass the Node 20 runtime constraint in supabase-js v2.110.0
if (!global.WebSocket) {
    global.WebSocket = class {
        constructor() {}
        addEventListener() {}
        removeEventListener() {}
    };
}

// Initialize the official Supabase client using your existing environment variables
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false
        }
    }
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PROD_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false
        }
    }
);

// 2. GLOBAL MIDDLEWARE SETUP (Now applied in the correct sequence)
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(pinoHttp());
app.use(express.json());

// SERVE FRONTEND DUMMY PAGES AND NEW DASHBOARD
// Securely serve the new dashboard UI files placed in the backend root
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Fallback to the public folder for older static files
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTE MODULES ---
app.use('/api/discovery', discoveryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orchestrator', orchestratorRoutes);


// --- PUBLIC INFRASTRUCTURE ENDPOINTS ---

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        message: "One Crew Backend Infrastructure is online."
    });
});


// --- AUTHENTICATION & SESSION HANDLING ENDPOINTS ---

// 1. EMAIL & PASSWORD REGISTRATION
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, onboardingData } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
             full_name: fullName,
             onboarding_data: onboardingData
            }
        }
    });

    if (error) return res.status(400).json({ error: error.message });

    // Handle Onboarding Data Insertion
    if (onboardingData && data.user) {
        try {
            // 1. Create the startup record
            const { data: startup, error: startupError } = await supabaseAdmin
                .from('startups')
                .insert({
                    user_id: data.user.id,
                    name: onboardingData.startupIdea || 'My Startup',
                    status: 'onboarding'
                })
                .select()
                .single();

            if (startup && !startupError) {
                // 2. Create the onboarding record
                const { error: onboardingError } = await supabaseAdmin
                    .from('startup_onboarding')
                    .insert({
                        startup_id: startup.id,
                        status: 'completed',
                        session_data: onboardingData
                    });
                
                if (onboardingError) {
                    req.log?.error({ onboardingError }, 'Failed to insert startup_onboarding during registration');
                }
                await generateWorkspace({
                    startupId: startup.id,
                    onboardingData,
                });
            } else if (startupError) {
                req.log?.error({ startupError }, 'Failed to insert startup during registration');
            }
        } catch (insertionError) {
            req.log?.error({ insertionError }, 'Unexpected error inserting startup data');
        }
    }

    return res.status(201).json({ message: 'Registration successful!', data });
});

// 2. EMAIL & PASSWORD LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(400).json({ error: error.message });
    
    // Returns the active JWT access token along with user session context
    return res.status(200).json({ message: 'Login successful', session: data.session });
});

// 3. GOOGLE OAUTH HANDSHAKE INITIATION
app.get('/api/auth/google', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Where Supabase will redirect the browser back to after Google finishes authenticating
            redirectTo: 'http://localhost:5000/api/auth/callback', 
        },
    });

    if (error) return res.status(400).json({ error: error.message });
    
    // Bounces the user directly to Google's official sign-in screen
    return res.redirect(data.url);
});

// 4. OAUTH HANDSHAKE CALLBACK GATEWAY
app.get('/api/auth/callback', async (req, res) => {
    // Once verified by Google, redirect to the AI Discovery dashboard
    return res.redirect('http://localhost:3000/dashboard');
});


// --- PRIVATE PROTECTED ENDPOINTS ---

app.get('/api/workspace/summary', verifyToken, (req, res) => {
    res.status(200).json({
        message: "Access granted to secure workspace metrics.",
        authenticatedUser: {
            id: req.user.id,
            email: req.user.email
        },
        data: {
            companyName: "One Crew Alpha Test",
            complianceStatus: "Pending Week 8 Hardcode Schedule"
        }
    });
});

// Dashboard overview route is now in routes/dashboardRoutes.js

// SERVER START INITIALIZATION
app.listen(PORT, () => {
    console.log(`🚀 Server securely running on http://localhost:${PORT}`);
});