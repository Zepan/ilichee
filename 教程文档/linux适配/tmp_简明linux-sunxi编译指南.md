# linux-sunxi简明编译指南

1. 从本项目的ConfigFiles里下载a13_linux_defconfig配置文件，该文件是a13的默认配置文件
2. 将上面的配置文件拷贝到arch/arm/configs/目录下，写入默认配置：
	`make ARCH=arm a13_linux_defconfig`
3. 可以视情况修改一下menuconfig配置：
	`make ARCH=arm menuconfig`
4. 编译linux内核镜像（注意下面的j24是你的开发机有多少线程就写多少）
	`make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- -j24 uImage`
5. 编译安装内核模块

```shell
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- -j24 INSTALL_MOD_PATH=out modules
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- -j24 INSTALL_MOD_PATH=out modules_install
```

可以在linux-sunxi/out/lib/modules/3.4.104下找到编译好的内核模块
