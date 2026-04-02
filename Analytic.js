// src/middleware/auth.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // If no token provided, allow request to continue (identifyUser will handle it)
    // This allows public routes and routes with x-auth-id header to work
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        // Invalid token, but don't block - let identifyUser handle it
        req.user = null;
        return next();
      }

      // Attach user info to request
      req.user = {
        authId: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      };
    } catch (tokenError) {
      // Token verification failed, but don't block - let identifyUser handle it
      req.user = null;
    }

    next();
  } catch (error) {
    // On unexpected errors, allow request to continue
    req.user = null;
    next();
  }
};
