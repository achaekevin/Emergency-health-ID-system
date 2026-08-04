# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your-mongodb-connection-string-here

# Supabase Configuration (for backend authentication)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here

# QR Code Encryption (optional - will use random key if not set)
# QR_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Frontend URL (comma-separated for multiple origins)
FRONTEND_URL=http://localhost:5173,http://localhost:3000

