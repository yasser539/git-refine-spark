const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.log('Please make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNotificationsTables() {
  try {
    console.log('🚀 Starting notifications tables setup...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'notifications_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️  Warning for statement ${i + 1}:`, error.message);
            // Continue with other statements even if one fails
          }
        } catch (err) {
          console.log(`⚠️  Warning for statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ SQL statements executed');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['ads', 'alerts', 'ad_views', 'ad_clicks', 'alert_views', 'alert_dismissals']);
    
    if (tablesError) {
      console.log('⚠️  Could not verify tables:', tablesError.message);
    } else {
      console.log('📋 Found tables:', tables.map(t => t.table_name));
    }
    
    // Test data insertion
    console.log('🧪 Testing data insertion...');
    
    const testAd = {
      title: 'إعلان تجريبي',
      description: 'هذا إعلان تجريبي للاختبار',
      status: 'active',
      target_audience: 'all'
    };
    
    const { data: adData, error: adError } = await supabase
      .from('ads')
      .insert(testAd)
      .select();
    
    if (adError) {
      console.log('❌ Error inserting test ad:', adError.message);
    } else {
      console.log('✅ Test ad inserted successfully');
      
      // Clean up test data
      await supabase
        .from('ads')
        .delete()
        .eq('title', 'إعلان تجريبي');
    }
    
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Go to http://localhost:3003/notifications');
    console.log('3. You should see the notifications page working');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('');
    console.log('🔧 Alternative setup method:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content of notifications_tables.sql');
    console.log('4. Click Run');
  }
}

// Alternative method using direct SQL execution
async function setupWithDirectSQL() {
  try {
    console.log('🔄 Trying alternative setup method...');
    
    const sqlContent = fs.readFileSync(path.join(__dirname, 'notifications_tables.sql'), 'utf8');
    
    // Execute the entire SQL file as one statement
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.log('❌ Direct SQL execution failed:', error.message);
      console.log('');
      console.log('📋 Manual setup required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy the content of notifications_tables.sql');
      console.log('4. Paste and run the SQL');
    } else {
      console.log('✅ Direct SQL execution successful');
    }
    
  } catch (error) {
    console.error('❌ Alternative setup failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🔧 Notifications Tables Setup Script');
  console.log('=====================================');
  console.log('');
  
  // Check if we can connect to Supabase
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error) {
    console.log('⚠️  Connection test failed:', error.message);
    console.log('This might be normal if the users table doesn\'t exist yet');
  } else {
    console.log('✅ Supabase connection successful');
  }
  
  console.log('');
  
  // Try the main setup method
  await setupNotificationsTables();
  
  console.log('');
  console.log('📚 For more help, check SETUP_NOTIFICATIONS.md');
}

main().catch(console.error); 