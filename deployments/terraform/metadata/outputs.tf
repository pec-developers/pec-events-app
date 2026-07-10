output "application_arn" {
  description = "The ARN of the AppRegistry application"
  value       = aws_servicecatalogappregistry_application.app.arn
}
