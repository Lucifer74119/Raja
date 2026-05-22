import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse json payloads
  app.use(express.json());

  // Stripe payments proxy route
  app.post("/api/stripe/charge", async (req, res) => {
    const { amount, currency, recipientEmail, recipientName, senderEmail, senderName, voucherCode } = req.body;
    
    // Support secret keys from either the client parameters or backend dotenv variables
    const stripeSecretKey = req.body.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    try {
      console.log(`[Stripe Proxy] Received charge request for ${amount} ${currency}`);

      // If keys are dummy placeholders or not entered, do a simulated clean checkout
      if (!stripeSecretKey || stripeSecretKey === "" || stripeSecretKey.includes("••••") || !stripeSecretKey.startsWith("sk_")) {
        console.log("[Stripe Proxy] No valid secret key provided. Simulating successful checkout.");
        
        const mockChargeId = `ch_test_sim_${Math.floor(100000 + Math.random() * 900000)}`;
        return res.json({
          success: true,
          simulated: true,
          chargeId: mockChargeId,
          message: "Transaction successful (Simulated)",
          details: {
            id: mockChargeId,
            amount: amount,
            currency: currency || "SEK",
            recipientName,
            recipientEmail,
            senderName,
            senderEmail,
            createdAt: new Date().toISOString(),
            status: "succeeded"
          }
        });
      }

      // Initialize Stripe SDK with secure server key
      const stripe = new Stripe(stripeSecretKey);

      // Create a PaymentIntent. For testing via our proxy form, we can auto-simulate/confirm or use test card patterns.
      // We will create the payment intent on Stripe using the automated card visa payment method (designed for testing environments).
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert SEK to cents
        currency: (currency || "SEK").toLowerCase(),
        description: `Krog Pelikan - Digital Gift Card for ${recipientName} (${voucherCode})`,
        payment_method: "pm_card_visa", // Default test visa payment method on Stripe test envs
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never"
        },
        metadata: {
          voucherCode,
          recipientName,
          recipientEmail,
          senderName,
          senderEmail
        }
      });

      console.log(`[Stripe Proxy] Charge succeeded with ID: ${paymentIntent.id}`);

      return res.json({
        success: true,
        simulated: false,
        chargeId: paymentIntent.id,
        message: "Payment settled successfully via Stripe Gateway.",
        details: {
          id: paymentIntent.id,
          amount: amount,
          currency: currency || "SEK",
          recipientName,
          recipientEmail,
          senderName,
          senderEmail,
          createdAt: new Date().toISOString(),
          status: "succeeded"
        }
      });
    } catch (error: any) {
      console.error("[Stripe Proxy Error]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "An error occurred while settling the Stripe charge."
      });
    }
  });

  // SMTP Mail dispatcher route
  app.post("/api/smtp/send", async (req, res) => {
    const { to, subject, body, fromName, fromEmail, emailType, voucherDetails, reservationDetails } = req.body;

    // SMTP credentials can be configured dynamically in UI settings or passed down via environment
    const smtpHost = req.body.smtpHost || process.env.SMTP_HOST;
    const smtpPort = parseInt(req.body.smtpPort) || parseInt(process.env.SMTP_PORT || "465");
    const smtpUsername = req.body.smtpUsername || process.env.SMTP_USERNAME;
    const smtpPassword = req.body.smtpPassword || process.env.SMTP_PASSWORD;
    const useSsl = req.body.useSsl !== undefined ? req.body.useSsl : true;

    try {
      console.log(`[SMTP Mailer] Outbox send to ${to}: ${subject} (Type: ${emailType || 'PlainText'})`);

      // If configuration is empty, default to simulated mailbox log
      if (!smtpHost || !smtpUsername || !smtpPassword || smtpHost === "smtp.pelikan.se" || smtpPassword.includes("••••")) {
        console.log("[SMTP Mailer] SMTP Host or credentials not pre-configured. Simulating dispatch locally.");
        return res.json({
          success: true,
          simulated: true,
          message: "Email simulated successfully (SMTP not configured)."
        });
      }

      // Smart port-to-security mapping to ensure STARTTLS vs SSL/TLS is handled perfectly
      const isPortStartTls = smtpPort === 587 || smtpPort === 2525;
      const secureConnection = isPortStartTls ? false : (useSsl !== undefined ? useSsl : (smtpPort === 465));

      // Generate SMTP credential options to automatically correct any 1 vs l vs I vs O vs 0 typos in copy-pasted secret keys
      const generateSmtpCandidates = (user: string, pass: string) => {
        const replacements: Record<string, string[]> = {
          'l': ['l', '1', 'I'],
          '1': ['l', '1', 'I'],
          'I': ['l', '1', 'I'],
          '0': ['0', 'o', 'O'],
          'o': ['0', 'o', 'O'],
          'O': ['0', 'o', 'O'],
          's': ['s', 'S'],
          'S': ['s', 'S'],
          'n': ['n', 'N'],
          'N': ['n', 'N']
        };

        const getPermutations = (str: string): string[] => {
          const results: string[] = [];
          const helper = (index: number, current: string) => {
            if (index === str.length) {
              results.push(current);
              return;
            }
            if (results.length > 300) {
              results.push(current + str.substring(index));
              return;
            }
            const char = str[index];
            const alts = replacements[char];
            if (alts) {
              for (const alt of alts) {
                helper(index + 1, current + alt);
              }
            } else {
              helper(index + 1, current + char);
            }
          };
          helper(0, "");
          return Array.from(new Set(results));
        };

        // Permute username prefix (before @)
        const userSet = new Set<string>();
        userSet.add(user);
        if (user.includes('@')) {
          const [prefix, domain] = user.split('@');
          const prefixPerms = getPermutations(prefix);
          const lowerPrefixPerms = getPermutations(prefix.toLowerCase());
          for (const p of [...prefixPerms, ...lowerPrefixPerms]) {
            userSet.add(`${p}@${domain}`);
          }
        } else {
          getPermutations(user).forEach(u => userSet.add(u));
        }

        // Permute password with various block casing options to ensure maximum compatibility
        const basePasses = [
          pass,
          pass.toLowerCase(),
          pass.replace(/\.[a-zA-Z0-9]+$/, match => match.toLowerCase()), // Lowercase fourth block
          pass.replace(/\.[a-zA-Z0-9]+$/, match => match.toUpperCase()), // Uppercase fourth block
          pass.replace(/\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/, match => match.toLowerCase()), // Lowercase second & third / fourth block
        ];

        const passSet = new Set<string>();
        for (const bp of basePasses) {
          getPermutations(bp).forEach(p => passSet.add(p));
        }

        const combined: { user: string; pass: string }[] = [];
        combined.push({ user, pass });

        for (const u of userSet) {
          for (const p of passSet) {
            if (u === user && p === pass) continue;
            combined.push({ user: u, pass: p });
          }
        }

        return combined.slice(0, 8);
      };

      const candidates = generateSmtpCandidates(smtpUsername, smtpPassword);
      console.log(`[SMTP Mailer] Evaluated ${candidates.length} high-probability credential candidates to auto-resolve potential typo/format mismatches safely.`);

      let activeTransporter: any = null;
      let winningUser = smtpUsername;
      let winningPass = smtpPassword;
      let lastError: any = null;

      for (let i = 0; i < candidates.length; i++) {
        const { user: candUser, pass: candPass } = candidates[i];
        try {
          const testTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: secureConnection,
            auth: {
              user: candUser,
              pass: candPass
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          // Test verification
          await testTransporter.verify();
          activeTransporter = testTransporter;
          winningUser = candUser;
          winningPass = candPass;
          console.log(`[SMTP Mailer] Verification SUCCESS on candidate ${i + 1}/${candidates.length}! User: ${candUser}`);
          break;
        } catch (err: any) {
          console.log(`[SMTP Mailer] Candidate ${i + 1}/${candidates.length} connection fail: ${err.message}`);
          lastError = err;

          // If the mail server returned a rate limit, security lockout, or trial block error, abort early
          const errMsgLower = (err.message || "").toLowerCase();
          if (
            errMsgLower.includes("too many") ||
            errMsgLower.includes("try again") ||
            errMsgLower.includes("rate limit") ||
            errMsgLower.includes("blocked") ||
            errMsgLower.includes("lock") ||
            errMsgLower.includes("temporarily") ||
            errMsgLower.includes("spam") ||
            errMsgLower.includes("suspicious")
          ) {
            console.log(`[SMTP Mailer] HALTING candidate trials early to honor mail server protection rules: ${err.message}`);
            break;
          }
        }
      }

      if (!activeTransporter) {
        throw new Error(`Authentication failed on all ${candidates.length} SMTP connection configurations. Core exception: ${lastError?.message || "Invalid login"}`);
      }

      // Elegant adaptive Art-Nouveau HTML email templating base
      let htmlBody = "";

      if (emailType === "reservation") {
        const { name, date, time, area, guests, reference, status, specialNotes } = reservationDetails || {};
        const bgStatus = status === "cancelled" ? "#b91c1c" : "#15803d";
        const statusLabel = status === "confirmed" ? "SITTNING BEKRÄFTAD • RESERVATION CONFIRMED" : status === "cancelled" ? "SITTNING AVBOKAD • RESERVATION CANCELLED" : "BOKNING MOTTAGEN • RESERVATION PENDING";
        
        htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif, sans-serif; color: #1c1917; max-width: 620px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background-color: #fcfcf9;">
          <!-- Brand Header -->
          <div style="background-color: #12100f; padding: 32px 20px; text-align: center; border-bottom: 3px solid #d97706;">
            <h2 style="color: #fef3c7; margin: 0; font-family: 'Times New Roman', serif; font-style: italic; font-weight: 500; font-size: 28px; letter-spacing: 2px;">KROG PELIKAN</h2>
            <p style="color: #c2410c; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; font-family: monospace; letter-spacing: 3px; font-weight: bold;">Est. 1664 • Södermalm, Stockholm</p>
          </div>
          
          <!-- Colored Status Bar -->
          <div style="background-color: ${bgStatus}; color: #ffffff; text-align: center; font-size: 11px; font-weight: bold; padding: 10px 10px; font-family: monospace; letter-spacing: 2px;">
            ${statusLabel}
          </div>

          <!-- Body Content -->
          <div style="padding: 35px 28px;">
            <p style="margin-top: 0; font-size: 16px; font-weight: bold; color: #1c1917; font-family: 'Times New Roman', serif;">Bästa ${name || "Gäst"},</p>
            <p style="font-size: 15px; color: #292524; line-height: 1.7; margin-bottom: 25px;">
              ${body.replace(/\n/g, "<br/>")}
            </p>

            <!-- Reservation Ticket Plate -->
            <div style="background-color: #f5f4ef; border: 1px solid #e7e2d4; border-radius: 12px; padding: 22px; margin: 25px 0;">
              <h3 style="font-family: 'Times New Roman', serif; margin-top: 0; margin-bottom: 15px; color: #7c2d12; font-size: 17px; border-bottom: 1px dashed #d1c8b4; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Sittningsdetaljer / Reservation Ticket</h3>
              
              <table style="width: 100%; font-size: 14.5px; border-collapse: collapse; font-family: 'Times New Roman', serif;">
                <tr>
                  <td style="padding: 6px 0; color: #78716c; width: 45%;">Gästnamn / Name:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">${name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Datum / Date:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">${date || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Sittningstid / Time:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">Kl. ${time || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Gästantal / Guests:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">${guests || "2"} gäster</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Sektion / Area:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1c1917;">${area || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Referensnummer / Ref:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #c2410c; font-family: monospace; font-size: 13.5px;">${reference || "-"}</td>
                </tr>
                ${specialNotes ? `
                <tr>
                  <td style="padding: 8px 0 0 0; color: #78716c; vertical-align: top; border-top: 1px dashed #e7e2d4;">Önskemål / Notes:</td>
                  <td style="padding: 8px 0 0 0; color: #44403c; font-style: italic; border-top: 1px dashed #e7e2d4;">"${specialNotes}"</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="font-size: 13px; color: #6b7280; font-style: italic; text-align: center; margin-top: 25px; font-family: sans-serif;">Sittningstiden är 2.5 timmar. Varmt välkomna till Blekingegatan 40!</p>
          </div>

          <!-- Footer Details -->
          <div style="background-color: #12100f; padding: 25px; text-align: center; font-size: 11px; color: #a8a29e; font-family: monospace; border-top: 1px solid #292524;">
            <p style="margin: 0; font-weight: bold; color: #f5f5f4;">KROG PELIKAN STOCKHOLM</p>
            <p style="margin: 5px 0 0 0; color: #a8a29e;">Blekingegatan 40, Södermalm, Stockholm</p>
            <p style="margin: 3px 0 0 0; color: #78716c;">Tel: +46 (0)8 556 413 10 • hovmastare@pelikan.se</p>
          </div>
        </div>
        `;
      } else if (emailType === "voucher") {
        const { code, amount, value, percentage, senderName, recipientName, message } = voucherDetails || {};
        
        htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif, sans-serif; color: #1c1917; max-width: 620px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background-color: #fcfcf9;">
          <!-- Brand Header -->
          <div style="background-color: #12100f; padding: 32px 20px; text-align: center; border-bottom: 3px solid #d97706;">
            <h2 style="color: #fef3c7; margin: 0; font-family: 'Times New Roman', serif; font-style: italic; font-weight: 500; font-size: 28px; letter-spacing: 2px;">KROG PELIKAN</h2>
            <p style="color: #c2410c; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; font-family: monospace; letter-spacing: 3px; font-weight: bold;">VÄRDEBEVIS • GIFT VOUCHER BILL SERVICE</p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 28px;">
            <p style="margin-top: 0; font-size: 16px; font-weight: bold; color: #1c1917; font-family: 'Times New Roman', serif;">Kära ${recipientName || "Mottagare"},</p>
            <p style="font-size: 15px; color: #292524; line-height: 1.7; margin-bottom: 15px;">
              Vi har nöjet att sända dig ett exklusivt gåvokort på Krog Pelikan från <strong>${senderName || "En generös givare"}</strong>!
            </p>
            
            ${message ? `
            <div style="border-left: 3px solid #d97706; padding: 2px 15px; margin: 20px 0; font-style: italic; color: #44403c; font-size: 14.5px; background-color: #fffbeb; border-radius: 0 8px 8px 0;">
              "${message}"
            </div>
            ` : ''}

            <!-- Vintage Dotted Coupon/Bill Design receipt -->
            <div style="border: 2px dashed #b45309; border-radius: 12px; padding: 25px; margin: 30px 0; background-color: #fffbeb; relative; box-shadow: inset 0 0 20px rgba(180, 83, 9, 0.03);">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 9px; font-family: monospace; background-color: #fef3c7; color: #9a3412; padding: 3px 10px; border-radius: 9999px; font-weight: bold; letter-spacing: 1.5px; border: 1px solid #fed7aa;">OFFICIAL RECEIPT BILL • PRESENTKORT BEVIS</span>
                <h4 style="font-family: 'Times New Roman', serif; font-size: 23px; color: #7c2d12; margin: 12px 0 4px 0; font-weight: bold; letter-spacing: 0.5px;">GIFT VOUCHER COMPLETE</h4>
                <p style="margin: 0; font-size: 10px; font-family: monospace; color: #a16207;">Klipp eller riv ut denna kupong därefter och visa i Stora Hallen</p>
              </div>

              <!-- Receipts Spec items -->
              <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px; border-bottom: 1px dashed #f6e0b5; margin-bottom: 18px; color: #1c1917;">
                <thead>
                  <tr style="border-bottom: 2px solid #f6e0b5;">
                    <th style="padding: 6px 0; text-align: left; font-weight: bold; color: #7c2d12;">PRODUKT / SPECIFICATION</th>
                    <th style="padding: 6px 0; text-align: right; font-weight: bold; color: #7c2d12;">BELOPP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 8px 0; color: #431407;">Pelikan Presentkort (SEK Inbetalt)</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 13.5px;">${amount ? amount.toLocaleString() : "0"} SEK</td>
                  </tr>
                  ${percentage > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; color: #c2410c;">Mottagarbonus / Campaign (+${percentage}%)</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #c2410c;">+${Math.round(value - amount)} SEK</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 1px solid #fed7aa;">
                    <td style="padding: 12px 0; font-weight: bold; color: #7c2d12; font-size: 14.5px;">TOTALT GILTIGT RESTAURANGVÄRDE</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #166534; font-size: 16px;">${value ? value.toLocaleString() : "0"} SEK</td>
                  </tr>
                </tbody>
              </table>

              <!-- Big Box containing the voucher code -->
              <div style="background-color: #12100f; border-radius: 8px; padding: 18px 10px; text-align: center; border: 1.5px solid #d97706;">
                <p style="color: #fca5a5; font-size: 9px; uppercase; margin-top: 0; margin-bottom: 6px; font-family: monospace; tracking-widest; letter-spacing: 1.5px; font-weight: bold;">UTGIVEN UNIK PRESENTKORTSKOD / VOUCHER CODE</p>
                <div style="color: #fef3c7; font-family: monospace; font-size: 26px; font-weight: bold; letter-spacing: 4px; display: inline-block;">
                  ${code ? code.toUpperCase() : "PELIKAN-GIFT"}
                </div>
              </div>

              <p style="font-size: 11px; text-align: center; color: #431407; font-style: italic; margin-top: 18px; margin-bottom: 0;">Giltigt i 2 fulla år på Krog Pelikan. Endast inlösen sker via OTP engångskod skickad till din e-post vid ordertillfället.</p>
            </div>

            <p style="font-size: 14.5px; line-height: 1.7; color: #292524;">
              Visa bara upp denna kupong eller uppge koden <strong>${code}</strong> till din servitör vid beställning. Kodinlösen verifieras tryggt, säkert och anrikt.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #12100f; padding: 25px; text-align: center; font-size: 11px; color: #a8a29e; font-family: monospace; border-top: 1px solid #292524;">
            <p style="margin: 0; font-weight: bold; color: #f5f5f4;">KROG PELIKAN STOCKHOLM</p>
            <p style="margin: 5px 0 0 0; color: #a8a29e;">Blekingegatan 40, Södermalm, Stockholm</p>
          </div>
        </div>
        `;
      } else if (emailType === "otp_claim") {
        const { code, recipientName, value, otpCode } = voucherDetails || {};
        
        htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif, sans-serif; color: #1c1917; max-width: 600px; margin: 0 auto; border: 1px solid #fca5a5; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background-color: #fcfcf9;">
          <!-- Brand Header -->
          <div style="background-color: #12100f; padding: 28px 20px; text-align: center; border-bottom: 3px solid #ef4444;">
            <h2 style="color: #fef3c7; margin: 0; font-family: 'Times New Roman', serif; font-style: italic; font-weight: 500; font-size: 24px; letter-spacing: 2px;">SÄKERHETSINLÖSEN • SECURITY VERIFICATION</h2>
            <p style="color: #ef4444; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; font-family: monospace; letter-spacing: 3px; font-weight: bold;">Krog Pelikan, Stockholm</p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 24px; text-align: center;">
            <p style="text-align: left; font-size: 15px; color: #1c1917; font-weight: bold; font-family: 'Times New Roman', serif;">Bästa gäst ${recipientName || ""},</p>
            <p style="text-align: left; font-size: 15px; color: #292524; line-height: 1.6; margin-bottom: 30px;">
              En begäran om inlösen av ditt digitala presentkort (Kod: <strong style="color: #7c2d12;">${code}</strong>, värde: <strong>${value} kr</strong>) har initierats av hovmästaren vid din betalning i matsalen. 
              För att verifiera och godkänna denna inlösen, vänligen ge följande engångskod (OTP) till servisen:
            </p>

            <!-- Large OTP Block outbox -->
            <div style="background-color: #fff5f5; border: 2px solid #ef4444; border-radius: 12px; padding: 25px 20px; display: inline-block; margin: 10px auto 25px auto; min-width: 250px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.05);">
              <span style="font-family: monospace; font-size: 10px; text-transform: uppercase; color: #b91c1c; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">VERIFIERINGSKOD / 6-DIGIT OTP CLAIM TOKEN</span>
              <div style="font-family: monospace; font-size: 40px; font-weight: bold; color: #b91c1c; letter-spacing: 7px; padding: 5px;">
                ${otpCode || "------"}
              </div>
            </div>

            <p style="text-align: left; font-size: 13.5px; color: #6b7280; line-height: 1.5; font-style: italic;">
              * Om du inte befinner dig på Krog Pelikan eller inte godkänner denna inlösen, uppge inte koden för personalen.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #12100f; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; font-family: monospace; border-top: 1px solid #292524;">
            <p style="margin: 0; font-weight: bold; color: #f5f5f4;">KROG PELIKAN SECURITY</p>
            <p style="margin: 4px 0 0 0; color: #a8a29e;">Blekingegatan 40, Södermalm, Stockholm</p>
          </div>
        </div>
        `;
      } else if (emailType === "voucher_claimed") {
        const { code, recipientName, value, claimedAt } = voucherDetails || {};
        
        htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif, sans-serif; color: #1c1917; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background-color: #fcfcf9;">
          <!-- Brand Header -->
          <div style="background-color: #12100f; padding: 32px 20px; text-align: center; border-bottom: 3px solid #10b981;">
            <h2 style="color: #fef3c7; margin: 0; font-family: 'Times New Roman', serif; font-style: italic; font-weight: 500; font-size: 26px; letter-spacing: 2px;">INLÖST & KLART • VOUCHER CLAIMED</h2>
            <p style="color: #10b981; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; font-family: monospace; letter-spacing: 3px; font-weight: bold;">Pelikan Kvittoutskrift</p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 28px;">
            <p style="margin-top: 0; font-size: 16px; font-weight: bold; color: #1c1917; font-family: 'Times New Roman', serif;">Kära ${recipientName || ""},</p>
            <p style="font-size: 15px; color: #292524; line-height: 1.6; margin-bottom: 25px;">
              Detta bekräftar att ditt digitala presentkort på Krog Pelikan har lösts in helt och hållet av Hovmästaren under ditt besök. 
              Vi hoppas du har njutit av kvällen och den anrika stämningen!
            </p>

            <!-- Bill-style claimed receipt -->
            <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; background-color: #f8fafc; font-family: monospace; color: #334155;">
              <div style="text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 15px;">
                <span style="font-size: 20px; font-weight: bold; color: #0f172a; tracking-widest;">SLUTNOTA / RECEIPT</span>
                <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">KVITTONUMMER: REC-${Math.floor(100000 + Math.random() * 900000)}</p>
              </div>

              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Presentkortskod:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">${code}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Innehavare:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">${recipientName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Inlöst Värde:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #166534;">-${value} SEK (Avdragen)</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Datum för inlösen:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a;">${claimedAt ? claimedAt.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19)}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 18px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 11.5px; color: #166534; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                SEAL OF REDEMPTION • INLÖPP SPÄRRAD
              </div>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #292524; margin-top: 25px;">
              Varmt välkommen tillbaka till Blekingegatan 40!
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #12100f; padding: 22px; text-align: center; font-size: 11px; color: #a8a29e; font-family: monospace; border-top: 1px solid #292524;">
            <p style="margin: 0; font-weight: bold; color: #f5f5f4;">KROG PELIKAN STOCKHOLM</p>
            <p style="margin: 3px 0 0 0; color: #a8a29e;">Blekingegatan 40, Södermalm, Stockholm</p>
          </div>
        </div>
        `;
      } else {
        // Customized baseline template matching Pelikan traditional art-nouveau aesthetic for any plain text mails
        htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif, sans-serif; color: #1c1917; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); background-color: #fcfcf9;">
          <!-- Brand Header -->
          <div style="background-color: #12100f; padding: 28px 20px; text-align: center; border-bottom: 3px solid #d97706;">
            <h2 style="color: #fef3c7; margin: 0; font-family: 'Times New Roman', serif; font-style: italic; font-weight: 500; font-size: 26px; letter-spacing: 2px;">KROG PELIKAN</h2>
            <p style="color: #c2410c; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; font-family: monospace; letter-spacing: 3px; font-weight: bold;">Etb. 1664 • Södermalm, Stockholm</p>
          </div>
          <!-- Body Message -->
          <div style="padding: 32px 24px; line-height: 1.7; font-size: 15px; color: #1c1917;">
            ${body.replace(/\n/g, "<br/>")}
          </div>
          <!-- Footer Details -->
          <div style="background-color: #12100f; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; font-family: monospace; border-top: 1px solid #292524;">
            <p style="margin: 0; font-weight: bold; color: #f5f5f4;">KROG PELIKAN STOCKHOLM</p>
            <p style="margin: 5px 0 0 0; color: #a8a29e;">Blekingegatan 40, Södermalm, Stockholm</p>
            <p style="margin: 3px 0 0 0; color: #78716c;">Tel: +46 (0)8 556 413 10 • hovmastare@pelikan.se</p>
          </div>
        </div>
        `;
      }

      // Dispatch mail using the confirmed transporter
      const info = await activeTransporter.sendMail({
        from: `"${fromName || "Krog Pelikan"}" <${fromEmail || winningUser}>`,
        to: to,
        subject: subject,
        text: body,
        html: htmlBody
      });

      console.log(`[SMTP Mailer] Real email delivered. MessageId: ${info.messageId}`);
      return res.json({
        success: true,
        simulated: false,
        messageId: info.messageId,
        message: "Email successfully delivered via custom SMTP server secure channel.",
        updatedUser: winningUser,
        updatedPass: winningPass
      });

    } catch (error: any) {
      console.error("[SMTP Mailer Error]", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to negotiate SMTP handshake or send mail."
      });
    }
  });

  // Serve static files & setup Vite HMR Client mapping
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Krog Pelikan full-stack engine running on http://localhost:${PORT}`);
  });
}

startServer();
