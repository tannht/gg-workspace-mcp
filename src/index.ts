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

async function getCalendarService() {
    const auth = await getAuthClient();
    return google.calendar({ version: 'v3', auth });
}

async function getDriveService() {
    const auth = await getAuthClient();
    return google.drive({ version: 'v3', auth });
}

async function getDocsService() {
    const auth = await getAuthClient();
    return google.docs({ version: 'v1', auth });
}

async function getSheetsService() {
    const auth = await getAuthClient();
    return google.sheets({ version: 'v4', auth });
}

async function getSlidesService() {
    const auth = await getAuthClient();
    return google.slides({ version: 'v1', auth });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ... (GMAIL, CALENDAR, DRIVE TOOLS REMAIN SAME)
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
      {
        name: "list_calendar_events",
        description: "List events from Google Calendar. Timezone: Asia/Ho_Chi_Minh.",
        inputSchema: {
          type: "object",
          properties: {
            max_results: { type: "number", default: 10 },
            days_back: { type: "number", default: 0 },
          },
        },
      },
      {
        name: "create_calendar_event",
        description: "Create a calendar event. Format: YYYY-MM-DDTHH:MM (VN Time).",
        inputSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            start_time: { type: "string" },
            end_time: { type: "string" },
            description: { type: "string" },
          },
          required: ["summary", "start_time", "end_time"],
        },
      },
      {
        name: "list_drive_folders",
        description: "List all folders in Google Drive.",
        inputSchema: {
          type: "object",
          properties: {
            parent_id: { type: "string", default: "root" },
          },
        },
      },
      {
        name: "search_drive",
        description: "Search for files in Google Drive.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
      // --- GOOGLE DOCS ---
      {
        name: "create_document",
        description: "Create a new Google Docs document.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            body_text: { type: "string" },
          },
          required: ["title"],
        },
      },
      {
        name: "get_document",
        description: "Get the full text content of a Google Docs document.",
        inputSchema: {
          type: "object",
          properties: {
            document_id: { type: "string" },
          },
          required: ["document_id"],
        },
      },
      {
        name: "append_to_document",
        description: "Append text to the end of a Google Docs document.",
        inputSchema: {
          type: "object",
          properties: {
            document_id: { type: "string" },
            text: { type: "string" },
          },
          required: ["document_id", "text"],
        },
      },
      // --- GOOGLE SHEETS ---
      {
        name: "create_spreadsheet",
        description: "Create a new Google Sheets spreadsheet.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            sheet_name: { type: "string", default: "Sheet1" },
          },
          required: ["title"],
        },
      },
      {
        name: "read_spreadsheet",
        description: "Read data from a Google Sheets spreadsheet.",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheet_id: { type: "string" },
            range: { type: "string", default: "Sheet1" },
          },
          required: ["spreadsheet_id"],
        },
      },
      {
        name: "update_spreadsheet",
        description: "Update cells in a spreadsheet. Values format: JSON 2D array.",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheet_id: { type: "string" },
            range: { type: "string" },
            values: { type: "string" },
          },
          required: ["spreadsheet_id", "range", "values"],
        },
      },
      {
        name: "append_to_spreadsheet",
        description: "Append rows to a spreadsheet. Values format: JSON 2D array.",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheet_id: { type: "string" },
            range: { type: "string" },
            values: { type: "string" },
          },
          required: ["spreadsheet_id", "range", "values"],
        },
      },
      // --- GOOGLE SLIDES ---
      {
        name: "create_presentation",
        description: "Create a new Google Slides presentation.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
          },
          required: ["title"],
        },
      },
      {
        name: "get_presentation",
        description: "Get metadata and slide content from a Google Slides presentation.",
        inputSchema: {
          type: "object",
          properties: {
            presentation_id: { type: "string" },
          },
          required: ["presentation_id"],
        },
      },
      {
        name: "add_slide",
        description: "Add a new slide to a presentation.",
        inputSchema: {
          type: "object",
          properties: {
            presentation_id: { type: "string" },
            layout: { type: "string", default: "BLANK" },
          },
          required: ["presentation_id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ... (GMAIL, CALENDAR, DRIVE HANDLERS REMAIN SAME)
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
        const str = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset="utf-8"', '', body].join('\n');
        const encodedMessage = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
        return { content: [{ type: "text", text: `✅ Email sent! ID: ${res.data.id}` }] };
    }

    if (name === "list_calendar_events") {
        const { max_results = 10, days_back = 0 } = args as { max_results?: number; days_back?: number };
        const calendar = await getCalendarService();
        const timeMin = new Date(Date.now() - days_back * 24 * 60 * 60 * 1000).toISOString();
        const res = await calendar.events.list({ calendarId: 'primary', timeMin, maxResults: max_results, singleEvents: true, orderBy: 'startTime' });
        const events = res.data.items || [];
        if (events.length === 0) return { content: [{ type: "text", text: "No events found." }] };
        const text = events.map(e => `- ${e.start?.dateTime || e.start?.date}: ${e.summary} (ID: ${e.id})`).join('\n');
        return { content: [{ type: "text", text }] };
    }

    if (name === "create_calendar_event") {
        const { summary, start_time, end_time, description = "" } = args as { summary: string; start_time: string; end_time: string; description?: string };
        const calendar = await getCalendarService();
        const res = await calendar.events.insert({ calendarId: 'primary', requestBody: { summary, description, start: { dateTime: `${start_time}:00`, timeZone: 'Asia/Ho_Chi_Minh' }, end: { dateTime: `${end_time}:00`, timeZone: 'Asia/Ho_Chi_Minh' } } });
        return { content: [{ type: "text", text: `✅ Event created: ${res.data.htmlLink}` }] };
    }

    if (name === "list_drive_folders") {
        const { parent_id = "root" } = args as { parent_id?: string };
        const drive = await getDriveService();
        const query = `'${parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const res = await drive.files.list({ q: query, fields: 'files(id, name, webViewLink)', pageSize: 100 });
        const items = res.data.files || [];
        if (items.length === 0) return { content: [{ type: "text", text: "No folders found." }] };
        const text = items.map(item => `📁 ${item.name}\n   ID: ${item.id}\n   Link: ${item.webViewLink || 'N/A'}\n`).join('\n');
        return { content: [{ type: "text", text }] };
    }

    if (name === "search_drive") {
        const { query } = args as { query: string };
        const drive = await getDriveService();
        const res = await drive.files.list({ q: query, fields: 'files(id, name, mimeType)' });
        const items = res.data.files || [];
        if (items.length === 0) return { content: [{ type: "text", text: "No files found." }] };
        const text = items.map(item => `- ${item.name} (${item.id})`).join('\n');
        return { content: [{ type: "text", text }] };
    }

    // --- GOOGLE DOCS HANDLERS ---
    if (name === "create_document") {
        const { title, body_text = "" } = args as { title: string; body_text?: string };
        const docs = await getDocsService();
        const doc = await docs.documents.create({ requestBody: { title } });
        const docId = doc.data.documentId!;
        if (body_text) {
            await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: [{ insertText: { location: { index: 1 }, text: body_text } }] } });
        }
        return { content: [{ type: "text", text: `✅ Document created: https://docs.google.com/document/d/${docId}/edit` }] };
    }

    if (name === "get_document") {
        const { document_id } = args as { document_id: string };
        const docs = await getDocsService();
        const doc = await docs.documents.get({ documentId: document_id });
        let text = `Title: ${doc.data.title}\n\n`;
        doc.data.body?.content?.forEach(element => {
            element.paragraph?.elements?.forEach(e => {
                if (e.textRun) text += e.textRun.content;
            });
        });
        return { content: [{ type: "text", text }] };
    }

    if (name === "append_to_document") {
        const { document_id, text } = args as { document_id: string; text: string };
        const docs = await getDocsService();
        const doc = await docs.documents.get({ documentId: document_id });
        const endIndex = (doc.data.body?.content?.slice(-1)[0].endIndex || 1) - 1;
        await docs.documents.batchUpdate({ documentId: document_id, requestBody: { requests: [{ insertText: { location: { index: endIndex }, text } }] } });
        return { content: [{ type: "text", text: `✅ Text appended to document ${document_id}` }] };
    }

    // --- GOOGLE SHEETS HANDLERS ---
    if (name === "create_spreadsheet") {
        const { title, sheet_name = "Sheet1" } = args as { title: string; sheet_name?: string };
        const sheets = await getSheetsService();
        const res = await sheets.spreadsheets.create({ requestBody: { properties: { title }, sheets: [{ properties: { title: sheet_name } }] } });
        return { content: [{ type: "text", text: `✅ Spreadsheet created: https://docs.google.com/spreadsheets/d/${res.data.spreadsheetId}/edit` }] };
    }

    if (name === "read_spreadsheet") {
        const { spreadsheet_id, range = "Sheet1" } = args as { spreadsheet_id: string; range?: string };
        const sheets = await getSheetsService();
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: spreadsheet_id, range });
        const values = res.data.values || [];
        if (values.length === 0) return { content: [{ type: "text", text: "No data found." }] };
        const text = values.map(row => row.join('\t')).join('\n');
        return { content: [{ type: "text", text }] };
    }

    if (name === "update_spreadsheet") {
        const { spreadsheet_id, range, values } = args as { spreadsheet_id: string; range: string; values: string };
        const sheets = await getSheetsService();
        const parsed = JSON.parse(values);
        await sheets.spreadsheets.values.update({ spreadsheetId: spreadsheet_id, range, valueInputOption: 'USER_ENTERED', requestBody: { values: parsed } });
        return { content: [{ type: "text", text: `✅ Updated ${range} in spreadsheet ${spreadsheet_id}` }] };
    }

    if (name === "append_to_spreadsheet") {
        const { spreadsheet_id, range, values } = args as { spreadsheet_id: string; range: string; values: string };
        const sheets = await getSheetsService();
        const parsed = JSON.parse(values);
        const res = await sheets.spreadsheets.values.append({ spreadsheetId: spreadsheet_id, range, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', requestBody: { values: parsed } });
        return { content: [{ type: "text", text: `✅ Appended ${res.data.updates?.updatedRows || 0} rows to ${range}` }] };
    }

    // --- GOOGLE SLIDES HANDLERS ---
    if (name === "create_presentation") {
        const { title } = args as { title: string };
        const slides = await getSlidesService();
        const res = await slides.presentations.create({ requestBody: { title } });
        return { content: [{ type: "text", text: `✅ Presentation created: https://docs.google.com/presentation/d/${res.data.presentationId}/edit` }] };
    }

    if (name === "get_presentation") {
        const { presentation_id } = args as { presentation_id: string };
        const slides = await getSlidesService();
        const res = await slides.presentations.get({ presentationId: presentation_id });
        const pres = res.data;
        let text = `Title: ${pres.title}\nSlides: ${pres.slides?.length || 0}\n`;
        pres.slides?.forEach((slide, i) => {
            const texts: string[] = [];
            slide.pageElements?.forEach(el => {
                el.shape?.text?.textElements?.forEach(te => {
                    if (te.textRun?.content) texts.push(te.textRun.content.trim());
                });
            });
            text += `  Slide ${i + 1}: ${texts.filter(t => t).join(' | ') || '(empty)'}\n`;
        });
        return { content: [{ type: "text", text }] };
    }

    if (name === "add_slide") {
        const { presentation_id, layout = "BLANK" } = args as { presentation_id: string; layout?: string };
        const slides = await getSlidesService();
        const pres = await slides.presentations.get({ presentationId: presentation_id });
        const layoutId = pres.data.layouts?.find(l => l.layoutProperties?.name?.toUpperCase() === layout.toUpperCase() || l.layoutProperties?.displayName?.toUpperCase() === layout.toUpperCase())?.objectId;
        const req: any = { createSlide: {} };
        if (layoutId) req.createSlide.slideLayoutReference = { layoutId };
        const res = await slides.presentations.batchUpdate({ presentationId: presentation_id, requestBody: { requests: [req] } });
        return { content: [{ type: "text", text: `✅ Slide added (ID: ${res.data.replies?.[0].createSlide?.objectId})` }] };
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
