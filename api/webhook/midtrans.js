const crypto = require("crypto");

async function sendTelegram(text) {
async function sendTelegramPhoto(caption){

    const photo =
    "https://reycloudpayment.legionteknologi.my.id/success.jpg";

    const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({

                chat_id:
                process.env.TELEGRAM_CHAT_ID,

                photo,

                caption,

                parse_mode:"HTML"

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

        await sendTelegramPhoto(`
🚀 <b>REYCLOUD PAYMENT INFO</b>

━━━━━━━━━━━━━━━━━━━━━━

${status}

━━━━━━━━━━━━━━━━━━━━━━

🧾 <b>Order ID</b>
<code>${data.order_id}</code>

💰 <b>Nominal</b>
Rp${nominal}

💳 <b>Metode Pembayaran</b>
${data.payment_type}

📊 <b>Status</b>
${data.transaction_status.toUpperCase()}

📅 <b>Waktu Transaksi</b>
${waktu}

🆔 <b>Transaction ID</b>
<code>${data.transaction_id}</code>

━━━━━━━━━━━━━━━━━━━━━━

🤖 <b>ReyCloud Payment Gateway</b>
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
