## 1. Local Supabase Configuration

- [x] 1.1 Update `deployments/supabase/config.toml` to disable native Twilio config (`[auth.sms.twilio] enabled = false`) and configure the custom `send_sms` hook (`[auth.hook.send_sms] enabled = true` and `uri = "http://host.docker.internal:54321/functions/v1/send-sms"`).
- [x] 1.2 Replace Twilio environment variables with MSG91 placeholders (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`) in `deployments/supabase/.env`.

## 2. Deno Edge Function

- [x] 2.1 Create the directory structure `deployments/supabase/functions/send-sms` and implement the `index.ts` containing the Deno handler to fetch MSG91 v5 OTP API.

## 3. CI/CD Deployment

- [x] 3.1 Modify `.github/workflows/infra-deploy.yml` to remove the Twilio credentials from `supabase-migrations` environment blocks.
- [x] 3.2 Add steps to deploy the `send-sms` Edge Function and set `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID` secrets using Supabase CLI.
