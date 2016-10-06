#!/bin/sh
sudo mount /dev/sdb1 mnt
mkimage -C none -A arm -T script -d boot.cmd boot.scr
sudo cp boot.scr mnt/boot.scr
sync
sudo umount /dev/sdb1
