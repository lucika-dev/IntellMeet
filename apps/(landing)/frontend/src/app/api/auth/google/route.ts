export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const returnTo = requestUrl.searchParams.get("return_to") || request.headers.get("referer") || `${origin}/dashboard`;
  const callbackUrl = new URL(`${origin}/auth/callback`);
  callbackUrl.searchParams.set("return_to", returnTo);
  const backendAuthUrl = process.env.BACKEND_AUTH_URL || "http://localhost:5000/api/auth/google";
  const redirectUrl = new URL(backendAuthUrl);
  redirectUrl.searchParams.set("redirectTo", callbackUrl.toString());
  return Response.redirect(redirectUrl.toString());
}