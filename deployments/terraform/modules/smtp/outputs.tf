data "supabase_apikeys" "main" {
  project_ref = var.project_ref
}

output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = data.supabase_apikeys.main.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "The private service role key. Keep secure and do not share!"
  value       = data.supabase_apikeys.main.service_role_key
  sensitive   = true
}

output "resend_domain_id" {
  description = "The ID of the registered Resend domain."
  value       = resend_domain.main.id
}

