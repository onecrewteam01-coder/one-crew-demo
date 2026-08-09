require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");


// Import the ws package we installed to satisfy Node 20 requirements
const ws = require('ws'); 

// Explicitly pass the ws library into the client configuration options
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false // Turn off session persistence for stateless API servers
    },
    global: {
      headers: { 'x-my-custom-header': 'onecrew-backend' }
    },
    // This tells Supabase explicitly to use our imported 'ws' library for its realtime engine
    realtime: {
      transport: ws
    }
  }
);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; 

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal Security Guard authentication fault.' });
  }
};

module.exports = verifyToken;