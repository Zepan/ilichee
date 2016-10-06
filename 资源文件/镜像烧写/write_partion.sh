#!/bin/sh
sudo fdisk /dev/sdb <<EOF
n
p
1

+16M

n
p
2


p
w
q
EOF


