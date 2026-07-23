const midtransClient = require("midtrans-client");


const core = new midtransClient.CoreApi({

    isProduction: true,

    serverKey:
    process.env.MIDTRANS_SERVER_KEY

});



async function telegram(message){

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


try{


    if(req.method !== "POST"){

        return res.status(405).json({

            success:false,

            message:"Method Not Allowed"

        });

    }



    const transaction =
    await core.transaction.notification(
        req.body
    );



    const {

        order_id,
        transaction_status,
        gross_amount,
        payment_type,
        transaction_time

    } = transaction;



    const price =
    Number(gross_amount)
    .toLocaleString("id-ID");



    console.log({
        order_id,
        transaction_status,
        gross_amount
    });



    let statusText="";



    if(
    transaction_status === "settlement" ||
    transaction_status === "capture"
    ){

        statusText="✅ LUNAS";


        await telegram(`
<b>🚀 REYCLOUD PAYMENT</b>

💰 Pembayaran Berhasil

🧾 Order:
<code>${order_id}</code>

💵 Nominal:
Rp${price}

💳 Metode:
${payment_type}

📅 Waktu:
${transaction_time}

Status:
${statusText}

<b>Terima kasih 🙏</b>
        `);


    }


    else if(transaction_status==="pending"){


        await telegram(`
<b>⌛ REYCLOUD PAYMENT</b>

Menunggu Pembayaran

🧾 Order:
<code>${order_id}</code>

💵 Nominal:
Rp${price}

💳 Metode:
${payment_type}
        `);


    }


    else{


        await telegram(`
<b>❌ REYCLOUD PAYMENT</b>

Transaksi gagal

🧾 Order:
<code>${order_id}</code>

Status:
${transaction_status}
        `);


    }



    return res.status(200).json({

        success:true,

        message:"Webhook received"

    });



}catch(error){


    console.log(error);


    return res.status(500).json({

        success:false,

        message:error.message

    });


}


};
