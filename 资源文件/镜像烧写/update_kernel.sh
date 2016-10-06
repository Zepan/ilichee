#!/bin/sh
sudo mount /dev/sdb1 mnt &&\
sudo cp uImage mnt/ &&\
sudo sync &&\
sudo umount /dev/sdb1 &&\
echo "####cp uImage ok!" 

