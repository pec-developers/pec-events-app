output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.backend.id
}

output "instance_public_ip" {
  description = "The public IP of the backend instance"
  value       = aws_instance.backend.public_ip
}

output "backend_security_group_id" {
  description = "The ID of the backend security group"
  value       = aws_security_group.backend_sg.id
}

output "backend_url" {
  description = "The URL of the backend API"
  value       = "api.${var.domain_name}"
}

output "private_key" {
  description = "The generated private key for backend SSH access (if create_key_pair is true)"
  value       = var.create_key_pair ? tls_private_key.backend_key[0].private_key_pem : null
  sensitive   = true
}
