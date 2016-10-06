#!/bin/sh
fex2bin a13-lichee.fex script.bin &&\
echo "gen script.bin ok!" &&\
sudo mount /dev/sdb1 mnt &&\
sudo cp script.bin mnt &&\
sudo sync &&\
sudo umount mnt &&\
echo "update ok!"

