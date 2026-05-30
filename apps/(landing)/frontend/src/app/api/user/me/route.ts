export async function GET(req: Request) {
  const token = req.headers.get("authorization");

  const res = await fetch("http://localhost:5000/api/user/me", {
    method: "GET",
    headers: {
      Authorization: token || "",
    },
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
