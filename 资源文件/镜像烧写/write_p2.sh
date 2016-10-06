#!/bin/sh
sudo mount /dev/sdb2 mnt
time sudo tar xzvf fs2.tar.gz -C mnt
sudo rm -rf mnt/lib/modules/*
sudo time cp -rf lib/modules/3.4.104/ mnt/lib/modules/
sync
sudo umount /dev/sdb2

