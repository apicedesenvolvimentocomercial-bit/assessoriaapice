// server.js
import express from "express";
import { google } from "googleapis";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
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
  const { name, clinic, city, whatsapp, revenue } = body;
  if (!name || !clinic || !city || !whatsapp) {
    return {"ok": false, "message": "Campos obrigatórios faltando."};
  }
  
  if (name.trim().split(/\s+/).length < 2)
    return { ok: false, message: "Informe seu nome completo." };

  const digits = whatsapp.replace(/\D/g, "");
  if (!/^\d{10,11}$/.test(digits))
    return { ok: false, message: "WhatsApp inválido. Informe com DDD (ex: 41 9 9999-9999)." };

  if (revenue && isNaN(Number(revenue.replace(/[R$.\s]/g, "").replace(",", "."))))

    return { ok: false, message: "Faturamento inválido. Informe apenas o valor (ex: 15000)." };

  return {"ok": true};
}

app.post("/api/lead", limiter, async (req, res) => {
  const erro = validate(req.body);
  if (!erro.ok) return res.status(400).json({ error: erro.message });

  const { name, clinic, city, whatsapp, revenue } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Página1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, clinic, city, whatsapp, revenue || "-", new Date().toLocaleString("pt-BR")]],
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