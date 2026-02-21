const url = "https://opzkdpnpqpkarrdpseww.supabase.co/rest/v1/products?select=name,images&limit=5";
const apiKey = "sb_publishable_zSgv1v8ApYO2x4NM7FTSUg_tcO77Ic7";

async function test() {
    const res = await fetch(url, {
        headers: {
            "apikey": apiKey,
            "Authorization": `Bearer ${apiKey}`
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
