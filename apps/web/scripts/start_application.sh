#!/bin/bash
cd /home/ubuntu/web

rm -rf /var/www/html/web/*
cp -r /home/ubuntu/web/dist/* /var/www/html/web/
chown -R apache:apache /var/www/html/web/

