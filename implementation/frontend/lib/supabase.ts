import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gtywzblkukeiznpniogj.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXd6YmxrdWtlaXpucG5pb2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Nzk1NjMsImV4cCI6MjA3OTQ1NTU2M30.M_DGrKMTAhR06nRGVd_w8w3g0R2xs6QzF7Qsx8ZU8-E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
