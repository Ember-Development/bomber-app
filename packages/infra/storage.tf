resource "aws_ebs_volume" "db_volume" {
  availability_zone = aws_instance.bomber_app.availability_zone 
  size              = 10           # GB
  type              = "gp3"
  tags = {
    Name = "${var.environment}-db-volume"
  }
  depends_on = [aws_instance.bomber_app]
}

resource "aws_volume_attachment" "db_attach" {
    device_name = "/dev/xvdf"
    volume_id = aws_ebs_volume.db_volume.id
    instance_id = aws_instance.bomber_app.id
    force_detach = true
}
