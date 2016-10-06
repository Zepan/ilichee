#!/bin/sh
sudo mount /dev/sdb1 mnt &&\
sudo cp uImage mnt/ &&\
sudo sync &&\
sudo umount /dev/sdb1 &&\
echo "####cp uImage ok!" &&\
rm -rf lib/ &&\
tar xvf lib.tar &&\
sudo mount /dev/sdb2 mnt &&\
sudo rm -rf mnt/lib/modules/* &&\
sudo cp -rf lib/modules/3.4.104/ mnt/lib/modules/ &&\
sudo sync &&\
sudo umount mnt &&\
echo "####cp modules ok!"

