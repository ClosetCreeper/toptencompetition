export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const tokenRes = await fetch("https://keyninestudios.onelogin.com/oidc/2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.ONELOGIN_CLIENT_ID,
        client_secret: process.env.ONELOGIN_CLIENT_SECRET
      })
    });

    const data = await tokenRes.json();
    if (data.error) {
      return res.status(401).json({ error: data.error_description || "Token exchange failed" });
    }

    // Option 1: send tokens back to frontend (simpler)
    res.status(200).json(data);

    // Option 2: set a secure cookie and return "ok"
    // res.setHeader("Set-Cookie", `admin_token=${data.access_token}; HttpOnly; Secure; Path=/; SameSite=Strict`);
    // res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
