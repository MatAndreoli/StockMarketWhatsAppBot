# 📈 Stock Market WhatsApp Bot

A WhatsApp bot that delivers real-time **FIIs** (Fundos de Investimento Imobiliário) and **Stocks** data straight to your chat. Send a command, and the bot fetches market data through the [StockMarketScrapyAzFunc](https://github.com/MatAndreoli/StockMarketScrapyAzFunc) Azure Function backend and replies with a rich, formatted summary — including price, dividends, valuation, reports, and more.

## ✨ Features

- **FIIs Data** — Current price, dividend yield, P/VP, net worth, latest distribution details, and management report links.
- **Stocks Data** — Current price, P/L, P/VP, ROE, CAGR, dividend yield, balance sheet info, and optional dividends history table.
- **Scheduled Updates** — Automatically sends FII/stock summaries to configured phone numbers on a cron schedule (powered by `node-schedule`).
- **URL Shortening** — Report and info links are automatically shortened via TinyURL for cleaner messages.
- **Retry Logic** — FII queries retry automatically (up to 2 times) when management reports fail to load.
- **Docker Support** — Ready-to-deploy Dockerfile with Chromium and Node 20 for headless WhatsApp Web sessions.
- **Azure Container Apps** — Pre-configured `app.yaml` for deployment on Azure Container Apps with persistent auth cache.

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Chromium** or **Google Chrome** installed (required by Puppeteer / whatsapp-web.js)

### Installation

```bash
git clone https://github.com/<your-user>/StockMarketWhatsAppBot.git
cd StockMarketWhatsAppBot
npm install
```

### Running

```bash
npm start
```

On first run, a **QR code** will be printed in the terminal. Scan it with WhatsApp to authenticate the bot. After that, session data is persisted locally via `LocalAuth` (stored in `.wwebjs_auth/`).

### Development

```bash
npm run ndmon   # uses nodemon for auto-restart on file changes
```

## 💬 Commands

Send any message to the bot to see the help menu. The supported commands are:

| Command | Description | Example |
|---|---|---|
| `!fiis <tickers>` | Get FII data for one or more tickers | `!fiis mxrf11 bcff11 xpml11` |
| `!stocks <tickers>` | Get stock data for one or more tickers | `!stocks petr4 vale3 itub4` |
| `!stocks <tickers> dividends` | Include dividends history table | `!stocks abev3 petr4 dividends` |

Tickers can be separated by **spaces**, **commas**, or both.

## 🗂️ Project Structure

```
.
├── index.js                  # Entry point — initializes the WhatsApp client and scheduler
├── onMessage.js              # Message router — dispatches commands to use cases
├── settings.js               # App settings (Azure Function URL)
│
├── clients/
│   ├── fiisApiClient.js      # HTTP client for the FIIs Azure Function endpoint
│   └── shortenUrl.js         # URL shortener via TinyURL API
│
├── usecases/
│   ├── fiisData.js           # Orchestrates FII data retrieval, formatting, and messaging
│   ├── stocksData.js         # Orchestrates Stocks data retrieval, formatting, and messaging
│   ├── getNormalizedFiisData.js  # Fetches FII data, separates FIIs missing reports, normalizes
│   ├── normalizeData.js      # Shortens URLs in report links
│   └── getMessageData.js     # Parses ticker symbols from user messages + text formatting utils
│
├── scheduler/
│   ├── index.js              # Scheduler class — cron-based scheduled messages via node-schedule
│   └── values.json           # Scheduler config: phone numbers, cron frequencies, ticker lists
│
├── logger/
│   └── loggerWinston.js      # Winston logger (console transport)
│
├── Dockerfile                # Docker image: Debian + Chromium + Node 20 via NVM
├── app.yaml                  # Azure Container Apps deployment manifest
└── package.json
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description |
|---|---|
| `AZURE_FUNCTION_URL` | Base URL of the [StockMarketScrapyAzFunc](https://github.com/MatAndreoli/StockMarketScrapyAzFunc) Azure Function that scrapes market data |

### Scheduler (`scheduler/values.json`)

```json
{
  "numbers": ["5511999999999"],
  "fiisFrequency": "0 8 1,15 * *",
  "stockFrequency": "0 8 1,15 * *",
  "fiis": ["mxrf11", "brco11", "vgia11", "..."],
  "stocks": []
}
```

| Field | Description |
|---|---|
| `numbers` | Phone numbers to receive scheduled updates (country code + number) |
| `fiisFrequency` | Cron expression for FII updates (default: 8 AM on the 1st and 15th) |
| `stockFrequency` | Cron expression for Stock updates |
| `fiis` | List of FII tickers to include in scheduled reports |
| `stocks` | List of Stock tickers to include in scheduled reports |

## 🐳 Docker

```bash
docker build -t stock-whatsapp-bot .
docker run -it stock-whatsapp-bot
```

> **Note:** The first run requires an interactive terminal (`-it`) to scan the QR code. For persistent sessions, mount the `.wwebjs_auth` directory as a volume.

## 🏗️ Architecture

```
┌──────────────┐    WhatsApp Web     ┌──────────────────┐
│  WhatsApp    │◄───────────────────►│   Bot (Node.js)  │
│  User        │    (Puppeteer)      │                  │
└──────────────┘                     │  ┌────────────┐  │
                                     │  │ Scheduler  │  │
                                     │  └─────┬──────┘  │
                                     │        │         │
                                     │  ┌─────▼──────┐  │
                                     │  │  Use Cases  │  │
                                     │  └─────┬──────┘  │
                                     └────────┼─────────┘
                                              │ HTTP
                                     ┌────────▼─────────────────────┐
                                     │  Azure Function             │
                                     │  (StockMarketScrapyAzFunc)  │
                                     └─────────────────────────────┘
```

## 📦 Dependencies

| Package | Purpose |
|---|---|
| [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) | WhatsApp Web client via Puppeteer |
| [puppeteer](https://pptr.dev/) | Headless browser for WhatsApp Web |
| [axios](https://axios-http.com/) | HTTP client for API calls |
| [node-schedule](https://github.com/node-schedule/node-schedule) | Cron-based job scheduling |
| [winston](https://github.com/winstonjs/winston) | Structured logging |
| [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) | QR code display in terminal |

## 🔗 Related Projects

| Repository | Description |
|---|---|
| [StockMarketScrapyAzFunc](https://github.com/MatAndreoli/StockMarketScrapyAzFunc) | Azure Function that scrapes FII and Stock data from financial websites. This bot consumes its API endpoints to retrieve market data. |

## 📄 License

ISC
