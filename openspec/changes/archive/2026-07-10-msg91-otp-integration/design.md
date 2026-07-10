## Context

Currently, Supabase local configuration in `deployments/supabase/config.toml` uses Twilio as the SMS provider. Twilio's cost model is not optimal for local operations (India), and we need a mechanism to integrate MSG91 for cost efficiency and TRAI DLT compliance. Since MSG91 is not natively supported as a provider inside Supabase Auth, we must implement an interceptor using the Supabase `send_sms` hook.

## Goals / Non-Goals

**Goals:**
- Intercept the Supabase SMS OTP dispatch process using the standard `send_sms` hook.
- Implement a Deno Edge Function at `deployments/supabase/functions/send-sms/index.ts` to parse the event and forward the OTP code to MSG91 via the v5 OTP API.
- Update local config files (`config.toml` and `.env`) to disable Twilio and configure the custom hook.
- Update the deployment pipeline (`infra-deploy.yml`) to deploy the edge function and set the required secrets in the hosted Supabase environment.

**Non-Goals:**
- Bypassing GoTrue verification logic (verification will still be handled by Supabase Auth).
- Modifying other authentication providers (e.g., OAuth, email, passkeys).

## Decisions

- **Use Deno Edge Function**: An Edge Function is the standard, modern, and non-blocking way to call external HTTP APIs (like MSG91) in Supabase. It keeps database transactions performant and handles Deno-native `fetch` easily.
- **Query Parameter Authentication for MSG91**: We will construct the HTTP request pointing to `https://control.msg91.com/api/v5/otp` passing `authkey`, `template_id`, and `mobile` as query parameters, and passing the custom OTP as a JSON body parameter (`{"otp": otp}`) matching the template placeholder.
- **DLT Compliance formatting**: The Edge Function will format the phone number by removing the leading `+` before routing to MSG91.

## Risks / Trade-offs

- **Synchronous Dependency**: If the MSG91 API fails or experiences high latency, OTP delivery fails. We minimize this risk by utilizing MSG91's performant regional routing and returning clear error status codes (e.g., 502) to Supabase so GoTrue can bubble the error up correctly.
