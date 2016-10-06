#!/bin/sh
dd if=fs2.img of=/dev/sdb2 bs=64K
sync
