output "db_password" {
  description = "The database master password (either generated or passed-in)"
  value       = local.db_password
  sensitive   = true
}

output "secret_arn" {
  description = "The ARN of the AWS Secrets Manager secret"
  value       = aws_secretsmanager_secret.backend_secret.arn
}

output "secret_name" {
  description = "The name of the AWS Secrets Manager secret"
  value       = aws_secretsmanager_secret.backend_secret.name
}
