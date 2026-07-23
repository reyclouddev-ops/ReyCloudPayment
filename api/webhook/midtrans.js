const crypto = require("crypto");

async function sendTelegram(text) {
    const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text,
                parse_mode: "HTML"
            })
        }
    );

    return response.json();
}

module.exports = async (req, res) => {
    try {

        if (req.method !== "POST") {
            return res.status(405).json({
                success: false,
                message: "Method Not Allowed"
            });
        }

        const data = req.body;

        // Validasi Signature Midtrans
        const signature = crypto
            .createHash("sha512")
            .update(
                data.order_id +
                data.status_code +
                data.gross_amount +
                process.env.MIDTRANS_SERVER_KEY
            )
            .digest("hex");

        if (signature !== data.signature_key) {
            return res.status(403).json({
                success: false,
                message: "Invalid Signature"
            });
        }

        const nominal = Number(data.gross_amount).toLocaleString("id-ID");
        const metode = data.payment_type;

        await sendTelegram(`
<b>🚀 REYCLOUD PAYMENT</b>

🧾 Order ID:
<code>${data.order_id}</code>

💰 Nominal:
Rp${nominal}

💳 Metode:
${metode}

📊 Status:
${data.transaction_status.toUpperCase()}

📅 Waktu:
${data.transaction_time}

🆔 Transaction ID:
<code>${data.transaction_id}</code>
`);

        return res.status(200).json({
            success: true,
            message: "Webhook received"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
