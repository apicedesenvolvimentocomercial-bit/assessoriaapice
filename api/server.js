// server.js
import express from "express";
import { google } from "googleapis";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
});

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

function validate(body) {
  const { nome, telefone, faturamento } = body;
  if (!nome || !telefone || !faturamento) return "Campos obrigatórios faltando.";
  if (typeof telefone !== "string" || !/^\d{10,11}$/.test(telefone.replace(/\D/g, "")))
    return "Telefone inválido.";
  if (isNaN(Number(faturamento))) return "Faturamento inválido.";
  return null;
}

app.post("/api/lead", limiter, async (req, res) => {
  const erro = validate(req.body);
  if (erro) return res.status(400).json({ error: erro });

  const { nome, telefone, faturamento } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nome, telefone, faturamento, new Date().toLocaleString("pt-BR")]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar dados." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));