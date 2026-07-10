# output "aws_application_arn" {
#   description = "The Service Catalog AppRegistry application ARN"
#   value       = data.terraform_remote_state.metadata.outputs.application_arn
# }

output "database_host" {
  description = "Database connection host"
  value       = module.database.db_host
}

output "database_port" {
  description = "Database connection port"
  value       = module.database.db_port
}

# output "backend_public_ip" {
#   description = "The public IP of the backend EC2 host"
#   value       = module.backend.instance_public_ip
# }

# output "backend_api_url" {
#   description = "The backend API domain"
#   value       = module.backend.backend_url
# }

# output "frontend_url" {
#   description = "The static website frontend URL"
#   value       = module.frontend.cloudfront_domain_name
# }

# output "frontend_s3_bucket_name" {
#   description = "The name of the S3 bucket hosting the static site"
#   value       = module.frontend.s3_bucket_name
# }

# output "cloudfront_distribution_id" {
#   description = "The CloudFront distribution ID"
#   value       = module.frontend.cloudfront_distribution_id
# }

# output "backend_private_key" {
#   description = "The generated private key for backend SSH access"
#   value       = module.backend.private_key
#   sensitive   = true
# }

output "supabase_project_ref" {
  description = "The project reference ID of the Supabase database"
  value       = module.database.project_id
}

output "db_url" {
  description = "The connection string for database migrations."
  value       = module.database.db_url
  sensitive   = true
}
