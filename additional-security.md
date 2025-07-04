# Additional Security Measures for File Swap App

## 1. Rate Limiting
- Implement rate limiting per IP address (e.g., 5 uploads per hour)
- Use Vercel's built-in rate limiting or a service like Upstash

## 2. Input Validation
- Validate file types and sizes
- Sanitize swap IDs and filenames
- Check for malicious file content

## 3. Environment Variables Needed
```env
# Use service role key (keep secret\!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep anon key for client-side operations (if needed)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Database Security
- Use service role for server-side operations
- Restrict anon role permissions
- Implement proper RLS policies
- Regular cleanup of expired data

## 5. File Storage Security
- Scan uploaded files for malware
- Implement file type restrictions
- Use signed URLs for downloads
- Auto-delete files after expiration
EOF < /dev/null
