/**
 * FurcaRiskAI – Web Application Environment & Supabase Config
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your own credentials from:
 * https://supabase.com/dashboard -> Project Settings -> API
 */
window.ENV_CONFIG = {
    // Your Supabase Project URL
    SUPABASE_URL: 'https://wdpukbmhvhlyortjwotj.supabase.co',
    
    // Your Supabase Public / Anon API Key
    SUPABASE_ANON_KEY: 'sb_publishable_REIoJWeL52wOfoOnEQX-ng_t-_7NvPE',

    // Fallback Backend API (when running local Express server)
    BACKEND_API_URL: 'http://localhost:3000/api'
};
