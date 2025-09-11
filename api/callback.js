export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) {
    return res.status(400).json({ error: "Missing code or redirectUri" });
  }

  try {
    // Encode client_id and client_secret for Basic Auth
    const basicAuth = Buffer.from(
      `${process.env.ONELOGIN_CLIENT_ID}:${process.env.ONELOGIN_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://keyninestudios.onelogin.com/oidc/2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await tokenRes.json();

    if (data.error) {
      return res.status(401).json({ error: data.error_description || "Token exchange failed" });
    }

    // Send tokens back to front-end
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
