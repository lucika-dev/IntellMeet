export async function POST(req: Request) {
  const token = req.headers.get("authorization");

  const res = await fetch("http://localhost:5000/api/auth/sync", {
    method: "POST",
    headers: {
      Authorization: token!,
    },
  });

  return new Response(await res.text(), {
    status: res.status,
  });
}