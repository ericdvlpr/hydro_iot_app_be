if (!process.env.SUPABASE_URL) {
    console.log('constants.ts', 'Make sure you have a `.env` file to populate your variables.')
  }
  
  export const SUPABASE_URL = process.env.REACT_NATIVE_SUPABASE_URL || 'https://dgskmuaxbopqtdnkjiiy.supabase.co'
  export const SUPABASE_ANON_KEY = process.env.REACT_NATIVE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2ttdWF4Ym9wcXRkbmtqaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MTk0NTYsImV4cCI6MjAyMDA5NTQ1Nn0.PKMUsvv2lLpoR_32zLuBfzRIbLFHEUVDgw6-co8JZo0'
  
  export const Styles = {
    fontNormal: 20,
    fontMedium: 28,
    fontLarge: 34,
    fontExtraLarge: 40,
    colorPrimary: 'black',
    spacing: 12,
  }