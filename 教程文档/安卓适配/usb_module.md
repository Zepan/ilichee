# usb适配简记

## usb调试信息太多，删减之

```shell
[  232.061924] [sw_hcd]: sw_hcd_urb_dequeue, sw_hcd(df8a28ec, 0x0, 0x3f),urb(dbd34f00, 1514, 0), dev = 3, ep = 2, dir = in
[  232.071179] sw_hcd_cleanup_urb: qh(0xd0df6e40,0x2,0x2), urb(0xdbd34f00,1514,0), ep(0xdf8a2a00,3,0xd0df6e40,0x  (null))
```

出处在

```shell
./linux-3.0/drivers/usb/sun5i_usb/hcd/core/sw_hcd_host.c:	DMSG_INFO("[sw_hcd]: sw_hcd_urb_dequeue, sw_hcd(%p, 0x%d, 0x%x),"
./linux-3.0/drivers/usb/sun5i_usb/hcd/core/sw_hcd_host.c:	DMSG_INFO("sw_hcd_cleanup_urb: qh(0x%p,0x%x,0x%x), urb(0x%p,%d,%d), ep(0x%p,%d,0x%p,0x%p)\n",
```

修改linux-3.0/drivers/usb/sun5i_usb/include/sw_usb_debug.h

```shell
/* 普通信息打印 */
#if  0
    #define DMSG_INFO         			DMSG_PRINT
#else
    #define DMSG_INFO(...)
#endif
```

## 3g网卡适配

安卓下开启3g网卡主要步骤是

1. 在驱动中勾选usb串口，pppd等
2. 调试通过usb_modeswitch, 模式切换后自动或者手动出现3个ttyUSBx设备
3. evdo脚本拨号

## 在内核配置里开启串口驱动，pppd驱动等

`Device Drivers -> USB support -> USB Serial Converter support USB driver for GSM and CDMA modems`

    <*>   PPP (point-to-point protocol) support
    [*]     PPP multilink support (EXPERIMENTAL)
    [*]     PPP filtering
    <*>     PPP support for async serial ports
    <*>     PPP support for sync tty ports
    <*>     PPP Deflate compression
    <*>     PPP BSD-Compress compression
    <*>     PPP MPPE compression (encryption) (EXPERIMENTAL)
    <*>     PPP over Ethernet (EXPERIMENTAL)
    <*>     PPP over IPv4 (PPTP) (EXPERIMENTAL)
    <*>     PPP over L2TP (EXPERIMENTAL)
    <*>     PPP on L2TP Access Concentrator
    <*>     PPP on PPTP Network Server

先在电脑上试着驱动3g网卡;

插上后查看内核信息：

    [ 8497.458906] usb 2-2.1: new full-speed USB device number 12 using uhci_hcd
    [ 8497.726318] usb 2-2.1: New USB device found, idVendor=1d09, idProduct=1000
    [ 8497.726323] usb 2-2.1: New USB device strings: Mfr=1, Product=2, SerialNumber=3
    [ 8497.726325] usb 2-2.1: Product: USB MMC Storage
    [ 8497.726327] usb 2-2.1: Manufacturer: Qualcomm, Incorporated
    [ 8497.726329] usb 2-2.1: SerialNumber: 000000000002
    [ 8497.729026] usb-storage 2-2.1:1.0: USB Mass Storage device detected
    [ 8497.729192] scsi host43: usb-storage 2-2.1:1.0
    [ 8498.732291] scsi 43:0:0:0: Direct-Access     Qualcomm MMC Storage      2.31 PQ: 0 ANSI: 2
    [ 8498.738204] scsi 43:0:0:1: CD-ROM            Qualcomm MMC Storage      2.31 PQ: 0 ANSI: 2
    [ 8498.741198] sd 43:0:0:0: Attached scsi generic sg3 type 0
    [ 8498.835612] sd 43:0:0:0: [sdb] Attached SCSI removable disk
    [ 8500.089041] sr 43:0:0:1: [sr2] scsi3-mmc drive: 357x/308x writer cdda 
    [ 8500.089184] sr 43:0:0:1: Attached scsi CD-ROM sr2
    [ 8500.089287] sr 43:0:0:1: Attached scsi generic sg4 type 5
    [ 8500.361385] sr 43:0:0:1: [sr2] CDROM (ioctl) error, command: 
    [ 8500.361391] Xpwrite, Read disk info 51 00 00 00 00 00 00 00 02 00
    [ 8500.361395] sr 43:0:0:1: [sr2] Sense Key : Hardware Error [current]
    [ 8500.361397] sr 43:0:0:1: [sr2] Add. Sense: No additional sense information

lsusb看网卡型号：

> Bus 002 Device 007: ID 1d09:1000 TechFaith Wireless Technology Limited

可以看到被识别成了安装光盘，sr2,手动弹出光盘后就变为正常的设备： `eject sr2`

//有些网卡需要发送特别的指令，需要使用usb_modeswitch切换模式

> Bus 002 Device 013: ID 1d09:e003 TechFaith Wireless Technology Limited

这就和usb_modeswitch的效果一样

    [ 8662.455084] usb 2-2.1: USB disconnect, device number 12
    [ 8666.948103] usb 2-2.1: new full-speed USB device number 13 using uhci_hcd
    [ 8667.220302] usb 2-2.1: New USB device found, idVendor=1d09, idProduct=e003
    [ 8667.220305] usb 2-2.1: New USB device strings: Mfr=1, Product=2, SerialNumber=4
    [ 8667.220307] usb 2-2.1: Product: CDMA 1x/EVDO Rev.A Device
    [ 8667.220309] usb 2-2.1: Manufacturer: Co.,Ltd
    [ 8667.220310] usb 2-2.1: SerialNumber: 000000000002
    [ 8667.240512] usb-storage 2-2.1:1.3: USB Mass Storage device detected
    [ 8667.246943] scsi host44: usb-storage 2-2.1:1.3
    [ 8668.253167] scsi 44:0:0:0: Direct-Access     Qualcomm MMC Storage      2.31 PQ: 0 ANSI: 2
    [ 8668.255704] sd 44:0:0:0: Attached scsi generic sg3 type 0
    [ 8668.271240] sd 44:0:0:0: [sdb] Attached SCSI removable disk

```eval_rst
.. tip:: PID=0x1D09， VID=0xe0003
```

在`drivers/usb/serial/option.c`里加入PID,VID（转换后的）

```c
//发现华为一个型号的PID一样。。
#define HUAWEI_PRODUCT_ET128                    0x1D09
#define HUAWEI_VENDOR_ID                        0x12D1
//自己加一个吧
 595 static const struct usb_device_id option_ids[] = {
 596     { USB_DEVICE(0xe0003, 0x1d09) }, //ID 1d09:1000 TechFaith Wireless Technology Limited
```

Device Monitoring Studio抓取3G网卡MessageContent

http://blog.chinaunix.net/uid-29764914-id-5181529.html

usb_modeswitch的使用（新版下的规则文件下载）

http://blog.csdn.net/yang1982_0907/article/details/45969179

但是切换后仍然没有ttyUSBx, 需要手工增加：

```shell
modprobe usb_wwan
modprobe option
echo "1d09 e003" > /sys/bus/usb-serial/drivers/option1/new_id
```

运行后出现了ttyUSB0~2
可以将它加入到udev规则中，在/lib/udev/rules.d/50-udev-default.rules(也可能再etc目录中)后面添加

    ACTION=="add", SUBSYSTEM=="usb",SYSFS{idVendor}=="1d09", SYSFS{idProduct}=="1000",
    RUN+="/usr/sbin/usb_modeswitch -c /etc/usb_modeswitch.conf"
    RUN+="echo '1d09 e003' > /sys/bus/usb-serial/drivers/option1/new_id"

//安卓下已经自带

```shell
vim /etc/usb_modeswitch.d/1d09_1000
DefaultVendor= 0x1d09
DefaultProduct= 0x1000

TargetVendor= 0x1d09
TargetProduct= 0xe003

StandardEject=1
CheckSuccess= 10	#wait 10s 
```

然后进行拨号，在`/etc/ppp/peers`目录下创建新文件evdo：

```shell
mkdir /etc/ppp/peers/
busybox vi /etc/ppp/peers/evdo
/dev/ttyUSB0
115200
nodetach
lock
user "ctnet@mycdma.cn"
password "vnet.mobi"
crtscts
show-password
usepeerdns
noauth
noipdefault
novj
novjccomp
noccp
defaultroute
ipcp-accept-local
ipcp-accept-remote
connect '/usr/sbin/chat -s -v -f /etc/ppp/peers/evdo-connect-chat'
#connect '/system/bin/chat -s -v -f /etc/ppp/peers/evdo-connect-chat'  #android
```

再创建**evdo-connect-chat**

`busybox vi /etc/ppp/peers/evdo-connect-chat`

```shell
TIMEOUT 2
ABORT 'NO CARRIER'
ABORT 'ERROR'
ABORT 'NO DIALTONE'
ABORT 'BUSY'
ABORT 'NO ANSWER'
"" ATE1
""      "AT+CFUN=1"
OK-AT-OK ATD#777
CONNECT ''
```

输入命令**pppd call evdo&**就可以上网了，断开网络就输入poff。

输出的拨号信息：

```shell
pppd call evdo
timeout set to 2 seconds
abort on (NO CARRIER)
abort on (ERROR)
abort on (NO DIALTONE)
abort on (BUSY)
abort on (NO ANSWER)
send (ATE1^M)
send (AT+CFUN=1^M)
expect (OK)
^M
OK
 -- got it

send (ATD#777^M)
expect (CONNECT)
^M
AT+CFUN=1^M^M
OK^M
ATD#777^M^M
CONNECT
 -- got it

send (^M)
Serial connection established.
Using interface ppp0
Connect: ppp0 <--> /dev/ttyUSB0
CHAP authentication succeeded: OK
CHAP authentication succeeded
local  IP address 10.100.35.16
remote IP address 125.88.103.85
primary   DNS address 114.114.114.114
secondary DNS address 223.5.5.5


^CTerminating on signal 2
Connect time 0.2 minutes.
Sent 355 bytes, received 126 bytes.
Connection terminated.
```

### 安卓上驱动

安卓上串口和dmesg的信息有限，主要看logcat

首次尝试pppd call evdo，log信息如下：

`pppd ( 1230): Can't create lock file /var/lock/LCK..ttyUSB0`

排查发现根本没有/var/lock目录，于是新建/var/run和/var/lock目录

    mkdir /var
    mkdir /var/run
    mkdir /var/lock

重新拨号，dmesg提示：

    timeout set to 2 seconds
    abort on (NO CARRIER)
    abort on (ERROR)
    abort on (NO DIALTONE)
    abort on (BUSY)
    abort on (NO ANSWER)
    send (ATE1^M)
    send (AT+CFUN=1^M)
    expect (OK)
    ATE1^M^M
    OK
     -- got it

    send (ATD#777^M)
    expect (CONNECT)
    ^M
    AT+CFUN=1^M^M
    OK^M
    ATD#777^M^M
    CONNECT
     -- got it

    send (^M)

logcat -v time提示

    01-02 08:01:51.419 I/pppd    ( 1195): Serial connection established.
    01-02 08:01:51.429 D/pppd    ( 1195): using channel 1
    01-02 08:01:51.479 I/pppd    ( 1195): Using interface ppp0
    01-02 08:01:51.479 I/pppd    ( 1195): Connect: ppp0 <--> /dev/ttyUSB0
    01-02 08:01:52.179 I/pppd    ( 1195): CHAP authentication succeeded: OK
    01-02 08:01:52.299 I/pppd    ( 1195): local  IP address 10.100.34.51
    01-02 08:01:52.299 I/pppd    ( 1195): remote IP address 125.88.103.85
    01-02 08:01:52.299 I/pppd    ( 1195): primary   DNS address 114.114.114.114
    01-02 08:01:52.299 I/pppd    ( 1195): secondary DNS address 223.5.5.5

ifconfig可见ppp0设备：

    ppp0      Link encap:Point-to-Point Protocol
            inet addr:10.100.46.132  P-t-P:125.88.103.85  Mask:255.255.255.255
            UP POINTOPOINT RUNNING NOARP MULTICAST  MTU:1430  Metric:1
            RX packets:3 errors:0 dropped:0 overruns:0 frame:0
            TX packets:3 errors:0 dropped:0 overruns:0 carrier:0
            collisions:0 txqueuelen:3
            RX bytes:54 (54.0 B)  TX bytes:54 (54.0 B)

此时已经可以ping 通`114.114.114.114`，但无法解析域名

```shell
busybox vi init.sun5i.rc
setprop "net.dns1" "8.8.8.8"      
setprop "net.dns2" "8.8.4.4"
```

### 安卓上3g网卡自动加载总结

0. 切换上网卡状态（/etc/usb_modeswitch.d/1d09_1000自动完成）

创建ttyUSB0等串口

`echo "1d09 e003" > /sys/bus/usb-serial/drivers/option1/new_id`

`/etc/ppp/peers/evdo /etc/ppp/peers/evdo-connect-chat` 拨号脚本（创建一次即可）

`mkdir /var /var/run /var/lock` 创建临时目录

`pppd call evdo&` 拨号上网，并设置dns

0已经自动完成

1. 需要在init.sun5i.rc里加上初始化
	
    on boot
    	 #echo "1d09 e003" > /sys/bus/usb-serial/drivers/option1/new_id		//太早执行无效
         exec /system/bin/sh /system/etc/ppp.sh	//这里延时到开机执行

2. 在sdk里加上对应的脚本
相关文件在`device/softwinner/common/rild`里，需要修改上层的`sw-common.mk`来拷贝文件到system分区

```shell
    PRODUCT_COPY_FILES += \
        device/softwinner/common/rild/ip-down:system/etc/ppp/ip-down \
        device/softwinner/common/rild/ip-up:system/etc/ppp/ip-up \
        device/softwinner/common/rild/call-pppd:system/etc/ppp/call-pppd \
        device/softwinner/common/rild/peers/evdo:system/etc/ppp/peers/evdo\
         device/softwinner/common/rild/peers/evdo-connect-chat:system/etc/ppp/peers/evdo-connect-chat\
```

3. 需要在init.sun5i.rc里加上初始化

```shell
    mkdir /var 0770 root system
    mount tmpfs none /var mode=0770,uid=0,gid=1000
    mkdir /var/run 0750 root system
    mkdir /var/lock 0750 root system
```

4. 需要在init.sun5i.rc里加上初始化

```shell
    service ppp /system/bin/pppd call evdo
         user root
         group system radio
         disabled
         oneshot
    setprop "net.dns1" "8.8.8.8"
	setprop "net.dns2" "8.8.4.4"
```
