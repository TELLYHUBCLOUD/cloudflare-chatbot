import handleChatRequest from "./chat";
import { ChatSession } from "./websocket";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === "/chat") {
      return await handleChatRequest(request, env);
    }
    
    if (url.pathname === "/ws") {
      let id = env.CHAT_SESSIONS.idFromName("global");
      let stub = env.CHAT_SESSIONS.get(id);
      return stub.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};

export { ChatSession };
