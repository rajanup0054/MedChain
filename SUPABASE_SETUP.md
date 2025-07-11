# Supabase Setup Guide for MedChain

This guide will help you set up Supabase for the MedChain application with real-time database functionality.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `medchain`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## 2. Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

## 3. Set Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Other existing variables
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_CONTRACT_ADDRESS=your_contract_address
```

## 4. Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the content from `supabase/migrations/create_medicines_schema.sql`
4. Click "Run" to execute the migration
5. Repeat for `supabase/migrations/insert_sample_data.sql`

Alternatively, if you have Supabase CLI installed:
```bash
supabase db push
```

## 5. Set Up Authentication (Optional)

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers
3. For email/password auth, ensure "Enable email confirmations" is set according to your needs
4. Update the site URL to your domain

## 6. Configure Row Level Security (RLS)

The migrations automatically set up RLS policies, but you can verify:

1. Go to **Authentication** → **Policies**
2. Ensure policies are created for all tables:
   - `medicines`
   - `locations`
   - `alerts`
   - `reorders`

## 7. Set Up Edge Function for Monitoring

1. In your Supabase dashboard, go to **Edge Functions**
2. Click "Create Function"
3. Name it `monitor-inventory`
4. Copy the code from `supabase/functions/monitor-inventory/index.ts`
5. Deploy the function

To set up automatic monitoring:
1. Go to **Database** → **Cron**
2. Create a new cron job:
   ```sql
   SELECT cron.schedule(
     'inventory-monitor',
     '*/15 * * * *', -- Run every 15 minutes
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/monitor-inventory'',
       headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb
     );'
   );
   ```

## 8. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any connection errors
3. Try adding a new medicine in the Dashboard
4. Verify real-time updates work by opening the app in two browser tabs

## 9. Database Schema Overview

### Tables Created:

- **medicines**: Core medicine inventory
- **locations**: Storage locations (hospitals, clinics, etc.)
- **alerts**: System alerts for expiry, low stock, etc.
- **reorders**: Purchase orders and restocking

### Key Features:

- **Real-time subscriptions**: UI updates automatically when data changes
- **Automatic monitoring**: Edge function monitors for expired/low stock items
- **Alert system**: Proactive notifications for critical situations
- **Audit trail**: All changes are timestamped

## 10. Production Considerations

1. **Security**: 
   - Never expose service_role key in frontend
   - Review and customize RLS policies
   - Enable 2FA on your Supabase account

2. **Performance**:
   - Add indexes for frequently queried columns
   - Consider connection pooling for high traffic
   - Monitor database usage in Supabase dashboard

3. **Backup**:
   - Enable automatic backups in Supabase settings
   - Consider point-in-time recovery for critical data

4. **Monitoring**:
   - Set up alerts for database performance
   - Monitor Edge Function execution logs
   - Track API usage and limits

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check if environment variables are set correctly
2. **RLS Error**: Ensure user is authenticated or policies allow access
3. **Real-time Not Working**: Check if subscriptions are properly set up
4. **Migration Fails**: Check for syntax errors or existing data conflicts

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API connection in Supabase dashboard
4. Check network tab for failed requests

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

Your MedChain application is now fully integrated with Supabase! 🚀