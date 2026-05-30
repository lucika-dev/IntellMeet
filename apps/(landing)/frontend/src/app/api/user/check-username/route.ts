export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("u") || "";
  const authHeader = req.headers.get("Authorization");

  const res = await fetch(
    `http://localhost:5000/api/user/check-username?u=${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    }
  );

  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
