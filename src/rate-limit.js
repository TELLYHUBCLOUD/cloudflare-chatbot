const SUPABASE_URL = "https://eonecuxctrpgrdxmwiei.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbmVjdXhjdHJwZ3JkeG13aWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNjUyMDEsImV4cCI6MjA1Mjg0MTIwMX0.XjliTqufiXcV5j02dKMt9hw7taZQ9JOe6dIrVbFgLXY";


export async function isRateLimited(userId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/ratelimit?user_id=eq.${userId}`, {
    method: "GET",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });

  const data = await response.json();
  if (data.length === 0) {
    await fetch(`${SUPABASE_URL}/rest/v1/ratelimit`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ user_id: userId, request_count: 1, last_request: Date.now() })
    });
    return false;
  }

  const lastRequest = data[0].last_request;
  const now = Date.now();
  const elapsedMinutes = (now - lastRequest) / (1000 * 60);

  if (elapsedMinutes < 1 && data[0].request_count >= 5) {
    return true;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/ratelimit?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ request_count: data[0].request_count + 1, last_request: now })
  });

  return false;
}
