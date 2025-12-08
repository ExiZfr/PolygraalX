const https = require('https');

const ZONE_ID = "e246493a53a4c21daddbf84aa2f2016c";
const TOKEN = "UdxSiRX2eaR4gm8x5nUspTOynaaxEbq1gopdDvzK";
const ACCOUNT_ID = "your_account_id"; // Nous allons le récupérer dynamiquement

function apiCall(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.cloudflare.com',
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = jsonData.length;
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${body}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log("🚀 Cloudflare Redirect Fix - Alternative Method");
    console.log("================================================\n");

    try {
        // ÉTAPE 1: Obtenir les informations de zone
        console.log("📋 [1/2] Getting zone info...");
        const zoneInfo = await apiCall('GET', `/client/v4/zones/${ZONE_ID}`);
        const accountId = zoneInfo.result.account.id;
        console.log(`   Account ID: ${accountId}`);
        console.log(`   Zone: ${zoneInfo.result.name}\n`);

        // ÉTAPE 2: Créer un Bulk Redirect List
        console.log("📝 [2/2] Creating Bulk Redirect...");

        // Créer une liste de redirections
        let listId;
        try {
            const listPayload = {
                name: "polygraalx_root_redirect",
                description: "Redirect root domain to app subdomain",
                kind: "redirect"
            };

            const listResult = await apiCall('POST', `/client/v4/accounts/${accountId}/rules/lists`, listPayload);
            listId = listResult.result.id;
            console.log(`   ✅ Redirect list created (ID: ${listId})`);
        } catch (err) {
            if (err.message.includes('already exists')) {
                // Récupérer l'ID de la liste existante
                const lists = await apiCall('GET', `/client/v4/accounts/${accountId}/rules/lists`);
                const existing = lists.result.find(l => l.name === "polygraalx_root_redirect");
                if (existing) {
                    listId = existing.id;
                    console.log(`   ℹ️  Using existing list (ID: ${listId})`);
                }
            } else {
                throw err;
            }
        }

        // Ajouter l'item de redirection
        if (listId) {
            const itemPayload = {
                items: [
                    {
                        source_url: "polygraalx.app",
                        target_url: "https://app.polygraalx.app",
                        status_code: 301,
                        preserve_query_string: true,
                        preserve_path_suffix: true,
                        include_subdomains: false
                    }
                ]
            };

            await apiCall('PUT', `/client/v4/accounts/${accountId}/rules/lists/${listId}/items`, itemPayload);
            console.log(`   ✅ Redirect item added`);
        }

        // Créer la règle qui utilise cette liste
        console.log("\n🔀 Creating redirect rule...");
        const rulePayload = {
            action: "redirect",
            action_parameters: {
                from_list: {
                    name: "polygraalx_root_redirect",
                    key: "http.request.full_uri"
                }
            },
            expression: "http.request.full_uri in $polygraalx_root_redirect",
            description: "Root to App Redirect",
            enabled: true
        };

        await apiCall('POST', `/client/v4/zones/${ZONE_ID}/rulesets/phases/http_request_redirect/entrypoint/rules`, rulePayload);
        console.log("   ✅ Redirect rule activated!\n");

        console.log("🎉 SUCCESS!");
        console.log("================================================");
        console.log("Redirection configured:");
        console.log("  polygraalx.app → https://app.polygraalx.app");
        console.log("\nTest: https://polygraalx.app");
        console.log("(Clear cache: Ctrl+Shift+R)");

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);

        console.log("\n📌 ALTERNATIVE SOLUTION:");
        console.log("Since API automation is complex, please do this manually:");
        console.log("1. Go to https://dash.cloudflare.com/");
        console.log("2. Select 'polygraalx.app'");
        console.log("3. Go to Rules > Redirect Rules");
        console.log("4. Create a new rule:");
        console.log("   - When: Hostname = polygraalx.app");
        console.log("   - Then: Redirect to https://app.polygraalx.app (301)");
        console.log("5. Deploy");
    }
}

main();
