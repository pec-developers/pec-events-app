terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0"
    }
  }
}

data "aws_route53_zone" "selected" {
  name         = var.dns_zone_name
  private_zone = false
}

# Conditionally manage/use default VPC and default subnet
resource "aws_default_vpc" "default" {
  count = var.use_default_vpc ? 1 : 0
}

resource "aws_default_subnet" "default" {
  count             = var.use_default_vpc ? 1 : 0
  availability_zone = "${var.aws_region}a"
}

# Conditionally create SSH private key and AWS key pair
resource "tls_private_key" "backend_key" {
  count     = var.create_key_pair ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "backend_key" {
  count      = var.create_key_pair ? 1 : 0
  key_name   = "pec-events-app-${replace(var.domain_name, ".", "-")}-key"
  public_key = tls_private_key.backend_key[0].public_key_openssh
  tags       = var.application_tag
}

locals {
  vpc_id    = var.use_default_vpc ? aws_default_vpc.default[0].id : var.vpc_id
  subnet_id = var.use_default_vpc ? aws_default_subnet.default[0].id : var.subnet_id
  key_name  = var.create_key_pair ? aws_key_pair.backend_key[0].key_name : var.key_name
}

resource "aws_security_group" "backend_sg" {
  name        = "${var.domain_name}-backend-sg"
  description = "Backend security group allowing HTTP, HTTPS, and SSH"
  vpc_id      = local.vpc_id

  ingress {
    description = "Allow HTTP traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      Name = "${var.domain_name}-backend-sg"
    },
    var.application_tag
  )
}

resource "aws_instance" "backend" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = local.key_name
  subnet_id              = local.subnet_id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.backend_profile.name

  associate_public_ip_address = true

  tags = merge(
    {
      Name = "${var.domain_name}-backend-host"
    },
    var.application_tag
  )
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_instance.backend.public_ip]
}

resource "aws_iam_role" "backend_role" {
  name = "${replace(var.domain_name, ".", "-")}-backend-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = var.application_tag
}

resource "aws_iam_instance_profile" "backend_profile" {
  name = "${replace(var.domain_name, ".", "-")}-backend-profile"
  role = aws_iam_role.backend_role.name
}

resource "aws_iam_policy" "backend_secrets_policy" {
  name        = "${replace(var.domain_name, ".", "-")}-backend-secrets-policy"
  description = "Allow backend instance to read Secrets Manager secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = [var.secret_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backend_secrets_attach" {
  role       = aws_iam_role.backend_role.name
  policy_arn = aws_iam_policy.backend_secrets_policy.arn
}
