variable "ami_id" {
  description = "The AMI ID to use for the instance"
  type        = string
}

variable "instance_type" {
  description = "The instance type to use for the instance"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "The key name to use for the instance (required if create_key_pair is false)"
  type        = string
  default     = ""
}

variable "create_key_pair" {
  description = "Whether to automatically create an SSH key pair for the instance"
  type        = bool
  default     = true
}

variable "subnet_id" {
  description = "VPC subnet ID to deploy the backend instance into (required if use_default_vpc is false)"
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "The VPC ID where security group should reside (required if use_default_vpc is false)"
  type        = string
  default     = ""
}

variable "use_default_vpc" {
  description = "Whether to use the AWS default VPC and subnet"
  type        = bool
  default     = true
}

variable "aws_region" {
  description = "The AWS region to determine the default subnet availability zone"
  type        = string
  default     = "ap-south-1"
}

variable "domain_name" {
  description = "The domain name for the backend API"
  type        = string
}

variable "dns_zone_name" {
  description = "The hosted zone name in Route 53"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}

variable "environment" {
  description = "The deployment environment name (e.g. dev, staging, prod)"
  type        = string
}

variable "secret_arn" {
  description = "The ARN of the AWS Secrets Manager secret containing backend configuration"
  type        = string
}
