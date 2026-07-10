data "supabase_apikeys" "main" {
  project_ref = local.project_ref
}

output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project or branch database."
  value       = local.project_ref
}

output "db_url" {
  description = "The connection string for database migrations."
  value       = local.use_branch ? "postgresql://postgres:${var.db_password}@${supabase_branch.main[0].database.host}:${supabase_branch.main[0].database.port}/postgres" : "postgresql://postgres:${var.db_password}@db.${local.project_ref}.supabase.co:5432/postgres"
  sensitive   = true
}

output "db_host" {
  description = "Database connection host"
  value       = local.use_branch ? supabase_branch.main[0].database.host : "db.${local.project_ref}.supabase.co"
}

output "db_port" {
  description = "Database connection port"
  value       = local.use_branch ? supabase_branch.main[0].database.port : 5432
}

output "supabase_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = "https://${local.project_ref}.supabase.co"
}

output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = data.supabase_apikeys.main.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "The private service role key."
  value       = data.supabase_apikeys.main.service_role_key
  sensitive   = true
}
