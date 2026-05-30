Deno.serve((req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers,
    })
  }

  return new Response("ok", {
    headers,
  })
})