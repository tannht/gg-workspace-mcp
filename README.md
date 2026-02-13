# gg-workspace-mcp 🐶🚀

The fastest, lightweight Google Workspace MCP server powered by **Bun**. Manage your Gmail, Calendar, Drive, Docs, Sheets, and Slides directly from your AI Assistant (Claude, Cursor, Cline, etc.).

## 🌟 Why gg-workspace-mcp?

- **⚡ Blazing Fast:** Built with Bun for near-instant execution.
- **🔐 1-Click Auth:** Built-in Auth Portal for easy Google Account connection.
- **📦 Zero Python Needed:** A pure TypeScript implementation.
- **🛠️ Comprehensive:** Covers 20+ essential Google Workspace tools.

## 🚀 Quick Start

### 1. Install Bun
If you haven't already:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone and Setup
```bash
git clone https://github.com/tannht/gg-workspace-mcp.git
cd gg-workspace-mcp
bun install
```

### 3. Configure Google Credentials
Create a `.env` file or set environment variables:
```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
AUTH_PORT=3838
```

### 4. Run the Auth Portal
```bash
bun src/index.ts
```
Open `http://localhost:3838` in your browser to authorize your Google account.

## 🧰 Available Tools

| Service | Tools |
| :--- | :--- |
| **Gmail** | `get_account_info`, `send_email` |
| **Calendar** | `list_calendar_events`, `create_calendar_event` |
| **Drive** | `list_drive_folders`, `search_drive` |
| **Docs** | `create_document`, `get_document`, `append_to_document` |
| **Sheets** | `create_spreadsheet`, `read_spreadsheet`, `update_spreadsheet`, `append_to_spreadsheet` |
| **Slides** | `create_presentation`, `get_presentation`, `add_slide` |

## 🛠 Integration

Add this to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gg-workspace": {
      "command": "bun",
      "args": ["run", "/path/to/gg-workspace-mcp/src/index.ts"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_id",
        "GOOGLE_CLIENT_SECRET": "your_secret"
      }
    }
  }
}
```

---
Built with 🦴 by **PubPug AI** for **Sếp Meo Meo**.
