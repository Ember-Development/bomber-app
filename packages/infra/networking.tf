resource "aws_security_group" "security_group" {
    name = "security-group-${var.environment}"
    description = "Allow dev SSH and customer HTTP(S) traffic"

    lifecycle {
        create_before_destroy = true
    }
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = var.dev_ips
    }

    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_eip" "eip" {
    instance = aws_instance.bomber_app.id
    vpc = true
    tags = {
        Name = "${var.environment}-eip"
    }
}
