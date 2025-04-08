#!/bin/bash
cd /home/ubuntu/web

rm -rf /var/www/html/*
cp -r /home/ubuntu/web/dist/* /var/www/html/
chown -R apache:apache /var/www/html/

