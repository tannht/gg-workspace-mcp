import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from 'googleapis';
import { getAuthClient, startAuthPortal } from './auth.js';

const server = new Server(
  {
    name: "gg-workspace-mcp",
    version: "2.1.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- GMAIL TOOLS ---

async function getGmailService() {
    const auth = await getAuthClient();
    return google.gmail({ version: 'v1', auth });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_account_info",
        description: "Get the email address of the currently authenticated Google account.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "send_email",
        description: "Send a simple email via Gmail.",
        inputSchema: {
          type: "object",
          properties: {
            to: { type: "string" },
            subject: { type: "string" },
            body: { type: "string" },
          },
          required: ["to", "subject", "body"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_account_info") {
      const gmail = await getGmailService();
      const res = await gmail.users.getProfile({ userId: 'me' });
      return {
        content: [{ type: "text", text: `🐶 Authenticated as: ${res.data.emailAddress} (TS Gâu!)` }],
      };
    }

    if (name === "send_email") {
        const { to, subject, body } = args as { to: string; subject: string; body: string };
        const gmail = await getGmailService();
        
        const str = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'Content-Type: text/plain; charset="utf-8"',
            '',
            body
        ].join('\n');

        const encodedMessage = Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
        });

        return {
            content: [{ type: "text", text: `✅ Email sent! ID: ${res.data.id}` }],
        };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `❌ Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  startAuthPortal();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Google Cloud MCP (TypeScript) running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
