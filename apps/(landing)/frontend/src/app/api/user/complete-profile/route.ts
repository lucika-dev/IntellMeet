export async function POST(req: Request) {
  const token = req.headers.get("authorization");
  const body = await req.json();

  const res = await fetch("http://localhost:5000/api/user/complete-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify(body),
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
