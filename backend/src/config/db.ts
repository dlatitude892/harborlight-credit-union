import mongoose from 'mongoose';
import dns from 'node:dns';

// On some Windows setups, Node's internal DNS resolver fails to look up the
// SRV record that `mongodb+srv://` connection strings require, even though
// the OS resolver (nslookup) succeeds. Pointing Node at a public resolver
// works around it. Safe to leave in for non-SRV URIs too - it's simply unused.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/harborlight_credit_union';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
