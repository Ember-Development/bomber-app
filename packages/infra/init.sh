#!/bin/bash

echo "${file("${path.module}/id_rsa.pub")}" >> /home/ubuntu/.ssh/authorized_keys
chmod 600 /home/ubuntu/.ssh/authorized_keys
chown ubuntu:ubuntu /home/ubuntu/.ssh/authorized_keys

# install dependencies
sudo apt-get update -y
sudo apt-get install -y apache2 nodejs npm postgresql postgresql-contrib

# storage
#NOTE: a bit of an assumption here, if failure to mount this might be why
VOLUME_DEVICE="/dev/nvme1n1" 
MOUNT_POINT="/mnt/db"

if ! mount | grep $MOUNT_POINT; then
  sudo mkfs -t ext4 $VOLUME_DEVICE
  sudo mkdir -p $MOUNT_POINT
  sudo mount $VOLUME_DEVICE $MOUNT_POINT
  echo "$VOLUME_DEVICE $MOUNT_POINT ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
fi

sudo systemctl enable apache2
sudo systemctl start apache2

sudo npm install -g pm2

sudo systemctl enable postgresql
sudo systemctl start postgresql

cd /home/ubuntu/your-project
npm install
npx prisma migrate deploy
npx prisma generate

# TODO: when we have CI/CD need to do something to check for existing code?
