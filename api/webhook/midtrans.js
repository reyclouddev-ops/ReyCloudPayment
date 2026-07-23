const midtransClient = require("midtrans-client");


const core = new midtransClient.CoreApi({

    isProduction: false,

    serverKey:
    process.env.MIDTRANS_SERVER_KEY

});


async function sendTelegram(message){

    const url =
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;


    await fetch(url,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            chat_id:
            process.env.TELEGRAM_CHAT_ID,

            text:message,

            parse_mode:"HTML"

        })

    });

}



module.exports = async(req,res)=>{


    if(req.method !== "POST"){

        return res.status(405).json({
            message:"Method Not Allowed"
        });

    }


    try{


        // cek notifikasi Midtrans

        const status =
        await core.transaction.notification(
            req.body
        );


        const orderId =
        status.order_id;


        const nominal =
        Number(status.gross_amount)
        .toLocaleString("id-ID");


        const transaction =
        status.transaction_status;



        console.log(`
=====================
ORDER : ${orderId}
NOMINAL : Rp${nominal}
STATUS : ${transaction}
=====================
        `);



        if(
            transaction === "settlement" ||
            transaction === "capture"
        ){


            await sendTelegram(`
<b>💰 PEMBAYARAN BERHASIL</b>

🧾 Order:
<code>${orderId}</code>

💵 Nominal:
Rp${nominal}

✅ Status:
LUNAS

🚀 ReyCloud Payment
            `);


        }



        if(transaction === "pending"){

            await sendTelegram(`
<b>⌛ PEMBAYARAN PENDING</b>

Order:
<code>${orderId}</code>

Nominal:
Rp${nominal}
            `);

        }



        res.status(200).send("OK");



    }catch(error){


        console.log(error);


        res.status(500).send("ERROR");


    }


};
