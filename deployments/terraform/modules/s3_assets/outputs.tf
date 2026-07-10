output "bucket_name" {
  description = "The name of the S3 bucket for student uploads"
  value       = aws_s3_bucket.assets_bucket.bucket
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket for student uploads"
  value       = aws_s3_bucket.assets_bucket.arn
}
