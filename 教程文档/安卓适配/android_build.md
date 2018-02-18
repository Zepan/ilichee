# 安卓编译简记

qq群里 @随风破浪 编译安卓一星期未果，我之前的开发机上的lichee目录又不小心被覆盖了，所以抽空简单记录下如何在原始sdk的基础上 修改适配，成功编译出可以跑在荔枝派上的安卓系统。

## 1. 编译环境准备

### 开发机系统要求

编译安卓需要64位linux系统，推荐**ubuntu 1404或者1604**，
开发机至少需要**4GB内存，40GB硬盘**；推荐**8GB内存，100GB硬盘**以上。
以下是开发过程中目录大小示意：

```shell
zp@ubuntu:~/develop$ du -lh --max-depth=1 v1.5.0/
26G	v1.5.0/android
6.8G	v1.5.0/lichee
33G	v1.5.0/

zp@ubuntu:~/develop$ du -lh --max-depth=1 a13_android4.1_v1.2/
5.2G	a13_android4.1_v1.2/lichee
23G	a13_android4.1_v1.2/android4.1
28G	a13_android4.1_v1.2/
```

开发机的CPU配置尽量高，笔者12线程并行编译，配以ssd，首次编译需要45分钟

网友双线程编译，耗时4小时左右。

### 开发机软件环境

首先安装开发所需要的软件包和一些库。
下面的一些安装包可能有些过时的，遇到版本问题请自行解决。

#### 在线安装 JDK6.0

```shell
sudo add-apt-repository "deb http://archive.canonical.com/ lucid partner"
sudo add-apt-repository ppa:ferramroberto/java
sudo apt-get update
sudo apt-get install sun-java6-jdk
sudo update-alternatives --c  onfig java
```

#### 在线安装编译库

```shell
sudo apt-get install git-core gnupg flex bison gperf build-essential zip curl zlib1g-dev libc6-dev
lib32ncurses5-dev ia32-libs  x11proto-core-dev libx11-dev lib32z1-dev libgl1-mesa-dev
g++-multilib mingw32 tofrodos python-markdown libxml2-utils
```

#### SDK下载

链接: http://pan.baidu.com/s/1c4gztvE

在SDK目录下 下载以下两个文件

```shell
lichee-4.1-v1.2.tar.gz
android4.1-v1.2.tar.gz
```

这是安卓4.1的SDK，前面的是4.2的SDK，
> 我手上的4.2 SDK的mali驱动ko和应用层库so版本对不上，换了从4.1里抠出的对应版本的so后，可以勉强启动系统，但是会不定时地出现缓冲队列满的问题导致ANR，所以暂时无法使用

在开发机上新建目录，如a13_android4.1
然后把两个sdk拷入，解压

把lichee对应的目录名改成lichee（即去掉版本号），目录如下所示

```shell
zp@ubuntu:~/develop/a13_android4.1_v1.2$ ls
android4.1  lichee
```

## 2. lichee编译

lichee是安卓系统的linux内核部分，需要首先编译，进入lichee目录执行：

```shell
./build.sh -p a13_nuclear -k 3.0
./build.sh pack
```

编译错误解析
编译过程中会出错，每个人由于其开发环境以及执行步骤的不同，错误都可能不同，下面以我编译时遇到的错误为例进行解析

- mali驱动编译出错

```shell
make: Entering directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali'
/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0
make -C DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump CONFIG=ca8-virtex820-m400-1 BUILD=release KDIR=/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0
make[1]: Entering directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump'
make -C /home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0 M=/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump modules
make[2]: Entering directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0'
  CC [M]  /home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump/common/ump_kernel_common.o
arm-none-linux-gnueabi-gcc: directory: No such file or directory
arm-none-linux-gnueabi-gcc: directory": No such file or directory
<command-line>:0:16: warning: missing terminating " character
make[3]: *** [/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump/common/ump_kernel_common.o] Error 1
make[2]: *** [_module_/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump] Error 2
make[2]: Leaving directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0'
make[1]: *** [all] Error 2
make[1]: Leaving directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump'
make: *** [build] Error 2
make: Leaving directory `/home/zp/develop/a13_android4.1_v1.2/lichee/linux-3.0/modules/mali'

real	2m35.400s
user	15m36.416s
sys	0m35.740s
```

进入排除可知是脚本里检查了SVN版本的问题，我们直接忽略SVN版本，将`linux-3.0/modules/mali/DX910-SW-99002-r3p1-01rel0/driver/src/devicedrv/ump` 目录下的SVN_REV直接赋值为0（在Kbuild和Makefile.common中）

重新编译，仍然是类似的错误，只是换了个目录，于是直接在mali驱动目录下全局搜索SVN_REV，将赋值的地方直接改为0

再重新编译成功

```shell
mkdir: created directory ‘/home/zp/develop/a13_android4.1_v1.2/lichee/out’
‘/home/zp/develop/a13_android4.1_v1.2/lichee/u-boot/u-boot.bin’ -> ‘/home/zp/develop/a13_android4.1_v1.2/lichee/out/android/u-boot.bin’
###############################
#         compile success     #
###############################

real	0m51.177s
user	1m1.324s
sys	0m4.736s
```

## 3. 安卓编译

```shell
进入安卓目录，执行以下命令序列：
source build/envsetup.sh		#导入一些环境变量
lunch 		#选择板型，直接选择10. nuclear_evb-eng，以后也直接在上面改
extract-bsp    #将lichee中编译得到的内核镜像和模块拷贝过来
time make -j12 2>&1  | tee log.txt   #编译system.img，这里-j12换成你电脑的线程数（核数*2）。12线程耗时约
pack     #打包成刷机镜像
```

编译system.img成功的提示：

```shell
Creating filesystem with parameters:
    Size: 536870912
    Block size: 4096
    Blocks per group: 32768
    Inodes per group: 8192
    Inode size: 256
    Journal blocks: 2048
    Label: 
    Blocks: 131072
    Block groups: 4
    Reserved block group size: 31
Created filesystem with 1443/32768 inodes and 102168/131072 blocks
+ '[' 0 -ne 0 ']'
Running:  mkuserimg.sh -s out/target/product/nuclear-evb/system out/target/product/nuclear-evb/obj/PACKAGING/systemimage_intermediates/system.img ext4 system 536870912
Install system fs image: out/target/product/nuclear-evb/system.img
out/target/product/nuclear-evb/system.img+out/target/product/nuclear-evb/obj/PACKAGING/recovery_patch_intermediates/recovery_from_boot.p maxsize=548110464 blocksize=4224 total=412271984 reserve=5537664

real	36m1.948s
user	350m4.772s
sys	14m16.936s
```

pack打包成功的提示：

```shell
/home/zp/develop/a13_android4.1_v1.2/lichee/tools/pack/pctools/linux/eDragonEx//home/zp/develop/a13_android4.1_v1.2/lichee/tools/pack/outBuildImg 0
Dragon execute image.cfg SUCCESS !
CPlugin Free lib
CPlugin Free lib
---------image is at-------------

/home/zp/develop/a13_android4.1_v1.2/lichee/tools/pack/sun5i_android_a13-evb.img
```

### 编译错误解析

1. 注意如果编译时突然中断，则可能出现文件截断的情况，需要先清空out 下子目录中的的obj目录，才好继续编译

例如下面错误就是：

```shell
target thumb C++: camera. <= device/softwinner/common/hardware/camera/HALCameraFactory.cpp
In file included from device/softwinner/common/hardware/camera/CameraHardwareDevice.h:26:0,
                 from device/softwinner/common/hardware/camera/HALCameraFactory.cpp:30:
device/softwinner/common/hardware/camera/CameraHardware.h:29:23: fatal error: videodev2.h: No such file or directory
compilation terminated.
make: *** [out/target/product/generic/obj/SHARED_LIBRARIES/camera._intermediates/HALCameraFactory.o] Error 1
make: *** Waiting for unfinished jobs....
```

2. 在pack时遇到以下错误（虽然不导致编译失败，但是启动时会造成错误）

```shell
fail:/home/zp/develop/a13_android4.1_v1.2/lichee/tools/pack/out/bootfs/sprite 0 
disk : c
CopyRootToFS(/home/zp/develop/a13_android4.1_v1.2/lichee/tools/pack/out/bootfs)
```

检查可以发现是lichee/tools/pack/pack中的打包脚本的这句出错：
`fsbuild bootfs.ini split_xxxx.fex`

这个fsbuild在运行时貌似无法打包bootfs的二级目录，不知为何。。有些人却没有反馈有这个问题，应该是个人的环境不同。

由于fsbuild是二进制提供的，只能通过其作用揣测实际功能，经过试验，上面那句可以用以下脚本代替，

基本作用就是构造一个fat文件系统镜像。

```shell
dd if=/dev/zero of=bootfs.fex bs=1M count=12
mkfs.vfat bootfs.fex
sudo mount bootfs.fex /mnt
sudo cp -r bootfs/* /mnt
sync
sudo umount /mnt
cat split_xxxx.fex >> bootfs.fex
```

3. 分区大小的问题（虽然不导致编译失败，但是启动时会造成错误）
如果往system.img里加入了太多东西，可能导致超出了默认的分区大小（512M），则需要修改默认分区规划

验证system.img的实际大小：
`simg2img system.img system.bin`

如果生成的system.bin大小刚好是512M，并且可以挂载，那就是正常的。
如果大小超过了512M，或者挂载时出错，那么就需要修正分区配置。

配置文件在`lichee/tools/pack/chips/sun5i/configs/android/a13-evb/sys_config.fex`

修改大小即可。

```shell
;------------------------------>nandd, android real rootfs
[partition3]
    class_name  = DISK
    name        = system
    size_hi     = 0
    size_lo     = 524288
    user_type   = 1
    ro          = 0
```

## 4. 镜像下载

前面pack打包完成后，会生成`sun5i_android_a13-evb.img`，这就是刷机镜像

镜像烧录工具是网盘中的PhoenixCard，打开后选择tf卡对应盘符，以及待烧录镜像，选择**卡启动**，进行烧录

![](https://box.kancloud.cn/77805d12cdca7a2c82220dc65501c9dc_762x500.png)

### 常见烧录错误

    偶尔会出现'处理出错'的提示，这时候一般只要重新烧录即可

## 5. 启动系统的适配过程

通过以上步骤编译的img还是不能在荔枝派上启动的，前面只能算是编译过一遍evb的安卓，需要在荔枝派上启动，还得进行一系列适配工作。

### 第一次启动（boot1跳转失败）

系统默认串口为UART1，接串口查看信息：

```shell
dram size =512
0xffffffff,0xffffffff
super_standby_flag = 0
HELLO! BOOT0 is starting!
boot0 version : 1.5.2
The size of Boot1 is 0x00036000.
Fail in checking boot1.
Ready to disable icache.
Fail in loading Boot1.
Jump to Fel.
```

可见DDR已被识别，但是加载boot1失败。

这其中的原因是DDR虽然被识别，但是参数配置错误，导致运行出错，所以我们需要先配置正确的DDR参数。

DDR参数记录在`sys_config1.fex`中，这里不过多解释`sys_config1.fex`的字段，直接使用之前在debian中适配好的fex文件覆盖

`lichee/tools/pack/chips/sun5i/configs/android/a13-evb/sys_config1.fex`

然后重新进行安卓编译过程。

编译完成后，可以直接重新烧写完整镜像，也可以只更新uboot和bootfs，后者需要对编译系统比较了解，在此不详细展开。

重新烧录后，可以看到闪过了两个开机画面，说明已经可以启动到linux内核了。

### 第二次启动（启动介质错误）

按前面修改后，启动会卡在第二张开机画面，查看串口信息：

```sh
[   16.009615] init: buffer : /dev/block/nande
[   16.014564] init: do_umount: /data 
[   16.018071] init: do_umount error = Invalid argument
[   17.390045] usb 2-1: device not accepting address 2, error -110
[   17.450200] ehci_irq: port change detect
[   17.454145] ehci_irq: port change detect
[   21.007468] init: buffer : /dev/block/nandh
[   21.012161] init: do_umount: /cache 
[   21.015755] init: do_umount error = Invalid argument
[   21.022007] init: open device error :No such file or directory
[   31.008863] init: buffer : /dev/block/nandi
[   31.013556] init: do_umount: /databk 
[   31.017237] init: do_umount error = Invalid argument
[   31.029268] init: cannot find '/system/bin/sh', disabling 'console'
[   31.035766] init: cannot find '/system/bin/servicemanager', disabling 'servicemanager'
[   31.043742] init: cannot find '/system/bin/vold', disabling 'vold'
[   31.049968] init: cannot find '/system/bin/netd', disabling 'netd'
[   31.056192] init: cannot find '/system/bin/debuggerd', disabling 'debuggerd'
[   31.063282] init: cannot find '/system/bin/rild', disabling 'ril-daemon'
[   31.069987] init: cannot find '/system/bin/surfaceflinger', disabling 'surfaceflinger'
[   31.077943] init: cannot find '/system/bin/app_process', disabling 'zygote'
[   31.084939] init: cannot find '/system/bin/drmserver', disabling 'drm'
[   31.091502] init: cannot find '/system/bin/mediaserver', disabling 'media'
[   31.098387] init: cannot find '/system/bin/dbus-daemon', disabling 'dbus'
[   31.105211] init: cannot find '/system/bin/installd', disabling 'installd'
[   31.112125] init: cannot find '/system/etc/install-recovery.sh', disabling 'flash_recovery'
[   31.120541] init: cannot find '/system/bin/keystore', disabling 'keystore'
[   31.127432] init: cannot find '/system/bin/u3gmonitor', disabling 'u3gmonitor'
[   31.135780] init: cannot find '/system/bin/sh', disabling 'console'
```

可见是tf卡启动与nand启动的不同造成linux内核挂载根文件系统出错，所以需要修改开机启动脚本，即 *.rc文件

    device/softwinner/nuclear-evb/init.sun5i.rc
    device/softwinner/nuclear-evb/ueventd.sun5i.rc

将其中的nandX按下面对应关系修改

    nanda —— mmcblk0p2
    nandb —— mmcblk0p5
    nandc —— mmcblk0p6
    nandd —— mmcblk0p7
    nande —— mmcblk0p8
    nandf —— mmcblk0p9
    nandg —— mmcblk0p10
    nandh —— mmcblk0p11
    nandi —— mmcblk0p12
    
其中有一句挂载剩余空间的替换也对应替换：

```shell
#format_userdata /dev/block/nandj NUCLEAR
exec /system/bin/busybox mount -t vfat  /dev/block/mmcblk0p1 /mnt/sdcard
```

再修改vold.fstab，开机挂载方式，前面两行改成以下，即sd卡0作为sdcard，sd卡2作为外置sd卡

```shell
dev_mount       sdcard  /mnt/sdcard     auto    /devices/platform/sunxi-mmc.0/mmc_host
dev_mount       extsd   /mnt/extsd      auto    /devices/platform/sunxi-mmc.2/mmc_host
```

    如果需要修改成sd卡2启动，则还需要修改uboot代码
    lichee\u-boot\include\configs中sun5i.a13.h文件中的卡启动定义
    #define CONFIG_MMC_SUNXI_SLOT 2

最后修改uboot的环境变量`env.cfg`(lichee/tools/pack/chips/sun5i/configs/android/default/env.cfg)

将mmc作为启动介质

```shell
bootdelay=1
#default bootcmd, will change at runtime according to key press
bootcmd=run setargs_mmc boot_normal#default nand boot
#kernel command arguments
console=ttyS0,115200
nand_root=/dev/system
mmc_root=/dev/mmcblk0p7
init=/init
loglevel=6
#set kernel cmdline if boot.img or recovery.img has no cmdline we will use this
setargs_nand=setenv bootargs console=${console} root=${nand_root} init=${init} loglevel=${loglevel} partitions=${partitions}
setargs_mmc=setenv bootargs console=${console} root=${mmc_root} init=${init} loglevel=${loglevel} partitions=${partitions}
#nand command syntax: sunxi_flash read address partition_name read_bytes
#0x40007800 = 0x40008000(kernel entry) - 0x800(boot.img header 2k)
boot_normal=sunxi_flash read 40007800 boot;boota 40007800
boot_recovery=sunxi_flash read 40007800 recovery;boota 40007800
boot_fastboot=fastboot
#recovery key
recovery_key_value_max=0x13
recovery_key_value_min=0x10
#fastboot key
fastboot_key_value_max=0x8
fastboot_key_value_min=0x2
```

修改完成后重新编译下安卓

为了省事，可以不下载整个镜像，只更新boot.fex和env.fex（lichee/tools/pack/out下）

在linux下，使用fdisk -l查看tf卡分区：

```c
   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1         3448832    15595518     6073343+   b  W95 FAT32   //剩余空间作为u盘
/dev/sdb2   *       73728      106495       16384    6  FAT16  //bootfs,含uboot
/dev/sdb3               1     3448832     1724416   85  Linux extended
/dev/sdb5          106496      139263       16384   83  Linux //env.fex
/dev/sdb6          139264      204799       32768   83  Linux	//boot.fex,含linux内核及ramdisk
/dev/sdb7          204800     1253375      524288   83  Linux	//system分区
/dev/sdb8         1253376     2301951      524288   83  Linux  //data分区
/dev/sdb9         2301952     2334719       16384   83  Linux   //misc分区
/dev/sdb10        2334720     2400255       32768   83  Linux //recovery分区
/dev/sdb11        2400256     2924543      262144   83  Linux  //cache分区
/dev/sdb12        2924544     3448831      262144   83  Linux  //databk分区
```

所以只需更新两个分区：

```shell
root@ubuntu64:/home/zp# dd if=env.fex of=/dev/sdb5
256+0 records in
256+0 records out
131072 bytes (131 kB) copied, 0.097856 s, 1.3 MB/s
root@ubuntu64:/home/zp# dd if=boot.fex of=/dev/sdb6
19916+0 records in
19916+0 records out
10196992 bytes (10 MB) copied, 8.54376 s, 1.2 MB/s
root@ubuntu64:/home/zp# sync
```

更新之后即可成功进入到安卓系统~

![](https://box.kancloud.cn/488a185c2d50f3f7447efb621d4d836e_2976x3968.jpg)

虽然此时可以进入系统，但是很多外设不能运行，这些外设的驱动适配见后面的外设适配解析。
