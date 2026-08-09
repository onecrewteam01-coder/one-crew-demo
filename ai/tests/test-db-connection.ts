import { supabase } from "../db/supabase";

async function testConnection() {
  const { data, error } = await supabase
    .from("startups")
    .select("*");

  if (error) {
    console.error("Connection failed:", error);
    return;
  }

  console.log("Connected successfully!");
  console.log(data);
}

testConnection();