export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = [];
  }

  async fetch(request) {
    let upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    let [client, server] = Object.values(new WebSocketPair());
    this.clients.push(server);
    
    server.accept();
    server.addEventListener("message", async (event) => {
      for (let client of this.clients) {
        client.send(event.data);
      }
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
