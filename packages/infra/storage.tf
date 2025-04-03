resource "aws_ebs_volume" "db_volume" {
  availability_zone = "us-east-1" 
  size              = 10           # GB
  type              = "gp3"
  tags = {
    Name = "db-volume"
  }
}

resource "aws_volume_attachment" "db_attach" {
    device_name = "/dev/xvdf"
    volume_id = aws_ebs_volume.db_volume.id
    instance_id = aws_instance.bomber_app.id
    force_detach = true
}
