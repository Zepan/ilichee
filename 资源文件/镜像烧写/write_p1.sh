#!/bin/sh
sudo mount /dev/sdb1 mnt
sudo cp uImage mnt/
sudo cp script.bin mnt/
sudo cp boot.scr mnt/
sync
sudo umount /dev/sdb1
echo "###write partion 1 ok!"


