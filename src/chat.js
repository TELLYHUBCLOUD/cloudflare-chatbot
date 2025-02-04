const SUPABASE_URL = "https://your-supabase-url.supabase.co";
const SUPABASE_KEY = "your-anon-key";

export default async function handleChatRequest(request, env) {
  const url = new URL(request.url);
  const question = url.searchParams.get("question");
  const id = url.searchParams.get("id");

  if (!question || !id) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
  }

  const chatData = await getChatHistory(id);
  chatData.messages.push({ role: "user", content: question });

  const aiResponse = await fetchAIResponse(chatData.messages);
  chatData.messages.push({ role: "assistant", content: aiResponse });

  await saveChatHistory(id, chatData.messages);

  return new Response(JSON.stringify({ response: aiResponse }), {
    headers: { "Content-Type": "application/json" }
  });
}

async function getChatHistory(userId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/chats?user_id=eq.${userId}`, {
    method: "GET",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });

  const data = await response.json();
  return data.length > 0 ? data[0] : { messages: [] };
}

async function saveChatHistory(userId, messages) {
  await fetch(`${SUPABASE_URL}/rest/v1/chats`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ user_id: userId, messages })
  });
}

async function fetchAIResponse(messages) {
  const response = await fetch("https://duckduck.arapi.workers.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, stream: false })
  });

  if (response.ok) {
    const json = await response.json();
    return json.choices?.[0]?.message?.content || null;
  }
  return null;
}
