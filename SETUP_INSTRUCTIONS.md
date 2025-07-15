# MedChain Setup Instructions

## 🚀 Quick Setup Guide

Follow these steps to get your MedChain application running:

### 1. Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. Supabase Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com)

2. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `medchain`
   - Set a strong database password
   - Select your region
   - Click "Create new project"

3. **Get your API credentials:**
   - Go to Settings → API
   - Copy your Project URL
   - Copy your anon/public key
   - Update your `.env` file with these values

### 3. Database Setup

1. **Go to your Supabase Dashboard → SQL Editor**

2. **Run the schema migration:**
   - Copy the contents of `supabase/migrations/create_medicines_schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Add sample data:**
   - Copy the contents of `supabase/migrations/insert_sample_data.sql`
   - Paste into SQL Editor
   - Click "Run"

### 4. Start the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - You should see the MedChain dashboard with sample data

## 🔧 Troubleshooting

### Common Issues:

1. **"Supabase not configured" error:**
   - Check your `.env` file exists and has correct values
   - Restart your development server after updating `.env`

2. **"Database tables not found" error:**
   - Run the database migrations in Supabase SQL Editor
   - Make sure both migration files were executed successfully

3. **"Cannot connect to Supabase" error:**
   - Check your internet connection
   - Verify your Supabase project is active
   - Confirm your API keys are correct

### Getting Help:

- Check the browser console for detailed error messages
- Verify your Supabase project status in the dashboard
- Ensure your API keys haven't expired

## 🎯 Next Steps

Once setup is complete, you can:

1. **Explore the Dashboard** - View medicines, alerts, and inventory
2. **Add New Medicines** - Use the "Add Medicine" button
3. **Test AI Features** - Try the AI Assistant with sample queries
4. **Verify Blockchain** - Test drug verification features
5. **Monitor Alerts** - Check the alerts panel for notifications

## 📚 Additional Features

### Optional Setup:

- **AI Features**: Add `VITE_GEMINI_API_KEY` for enhanced AI capabilities
- **Blockchain**: Add `VITE_CONTRACT_ADDRESS` for blockchain verification
- **Backend API**: Set `VITE_BACKEND_URL` if using the Python backend

Your MedChain application is now ready to use! 🚀