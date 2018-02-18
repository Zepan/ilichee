# RTL8723BU wifi模块适配

## linux驱动添加

安卓下使能外设驱动都需要先适配好linux下驱动，所以首先来编译linux驱动模块

1. 拷贝官方驱动（github的资源文件目录下下载）到lichee的linux驱动目录下

```shell
zp@ubuntu:~/develop/a13_android4.1_v1.2/lichee$ ls linux-3.0/drivers/net/wireless/rtl8723bu/
clean  core  hal  ifcfg-wlan0  include  Kconfig  Makefile  os_dep  platform  runwpa  wlan0dhcp
```

2. 配置驱动Makefile以及Kconfig，然后在menuconfig里选中刚加入的驱动

```shell
CONFIG_PLATFORM_ARM_SUNxI = y
obj-$(CONFIG_RTL8723BU) += rtl8723bu/
source "drivers/net/wireless/rtl8723bu/Kconfig"
<M> Realtek 8723B USB WiFi
```

3. 重新编译lichee，获得内核模块

```shell
./build.sh -p a13_nuclear -k 3.0
zp@ubuntu:~/develop/a13_android4.1_v1.2/lichee$ ls out/android/lib/modules/3.0.8+/87*
out/android/lib/modules/3.0.8+/8723bu.ko
```

4. 修改wifi驱动，隐藏过多调试信息

前面这样生成的ko带有很多调试信息输出，以至于开启wifi模块时太慢，导致打开wifi超时，所以需要隐藏多余的信息。
编辑`linux-3.0/drivers/net/wireless/rtl8723bu/include/autoconf.h`，去掉DEBUG的相关宏定义。

## 安卓配置文件

1. 修改板级配置文件`device/softwinner/nuclear-evb/BoardConfig.mk`

```shell
BOARD_WIFI_VENDOR := realtek
ifeq ($(BOARD_WIFI_VENDOR), realtek)
    WPA_SUPPLICANT_VERSION := VER_0_8_X
    BOARD_WPA_SUPPLICANT_DRIVER := NL80211
    BOARD_WPA_SUPPLICANT_PRIVATE_LIB := lib_driver_cmd_rtl
    BOARD_HOSTAPD_DRIVER        := NL80211
    BOARD_HOSTAPD_PRIVATE_LIB   := lib_driver_cmd_rtl

    SW_BOARD_USR_WIFI := rtl8723bu
    BOARD_WLAN_DEVICE := rtl8723bu
endif
```

2. 修改init启动脚本init.sun5i.rc

```shell
# 1.1 realtek wifi sta service
service wpa_supplicant /system/bin/wpa_supplicant -iwlan0 -Dnl80211 -c/data/misc/wifi/wpa_supplicant.conf -e/data/misc/wifi/entropy.bin
        class main
        socket wpa_wlan0 dgram 660 wifi wifi
        disabled
        oneshot

# 1.2 realtek wifi sta p2p concurrent service
service p2p_supplicant /system/bin/wpa_supplicant \
        -ip2p0 -Dnl80211 -c/data/misc/wifi/p2p_supplicant.conf -e/data/misc/wifi/entropy.bin -N \
        -iwlan0 -Dnl80211 -c/data/misc/wifi/wpa_supplicant.conf
        class main
        socket wpa_wlan0 dgram 660 wifi wifi
        disabled
        oneshot
```

3. 修改安卓板级mk文件nuclear_evb.mk（蓝牙需要，wifi不用改）

4. 修改安卓hardware相关代码hardware/libhardware_legacy/wifi/wifi.c

```c
  #elif defined RTL_8723BU_WIFI_USED
    /* rtl8723bu usb wifi */
    #ifndef WIFI_DRIVER_MODULE_PATH
    #define WIFI_DRIVER_MODULE_PATH         "/system/vendor/modules/8723bu.ko"
    #endif
    #ifndef WIFI_DRIVER_MODULE_NAME
    #define WIFI_DRIVER_MODULE_NAME         "8723bu"
    #endif

    #ifndef WIFI_DRIVER_MODULE_ARG
    #define WIFI_DRIVER_MODULE_ARG         "ifname=wlan0 if2name=p2p0"
```

5. wifi的安卓mk修改

```shell
hardware/libhardware_legacy/wifi/Android.mk
ifeq ($(SW_BOARD_USR_WIFI), rtl8723bu)
LOCAL_CFLAGS += -DRTL_8723BU_WIFI_USED
LOCAL_CFLAGS += -DRTL_WIFI_VENDOR
endif
```

6. wpa的安卓mk修改

```shell
external/wpa_supplicant_8/wpa_supplicant/Android.mk
ifeq ($(SW_BOARD_USR_WIFI), rtl8188eu)
L_CFLAGS += -DCONFIG_WFD
endif
```

7. 重新编译安卓

实际需要更新的就只有libhardware_legacy.so和8723bu.ko，当然也可以打包整个镜像重新烧写。

以局部更新为例，挂载tf卡的QQA，拷贝so到`lib/libhardware_legacy.so`

拷贝ko到`vendor/modules`

sync后启动即可
