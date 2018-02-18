开箱经历
=============

谁都会有个第一次
--------------------

wifi/显示屏/摄像头版到货，怀着激动地心情打开，最快速的插上屏幕，插上摄像头，找了个手机充电器电源上电，RGBLED一闪，我还以为会有什么其他的呢，然而并没有。

安卓镜像烧写
--------------------

首先进行的是安卓镜像的傻瓜是烧写，目的检测收到的荔枝皮一切都正常。烧写群主提供的镜像文件安4.1版本，启动成功，然而wifi打不开。以为是wifi有问题呢，群里一问，原来wifi驱动不对头，群里还有共享wifi驱动补丁，所幸下载写来，突然感觉我等之菜竟然不会装驱动。好吧！群主的话把所有的坑都自己经历一遍这就是在进步，怀揣这句话，打开百度。。。经过各种搜索，，，一切的线索都指向了adb调试。给电脑装好adb驱动，荔枝派开机连上数据线，电脑设备管理器应该有adb设备了，好吧 有点啰嗦，进入cmd调试查找设备（自行百度），然后链接adb shell寻找驱动所在地，，这么多文件夹，，，皇天不负，，笨办法也能找到。替换文件，wifi就这么打开了。好累一晚上就干了点这个。装上哔哩哔哩看了一集海贼王睡觉。

Linux镜像烧录
--------------------

打开群主debian烧录指南，自行学习dd命令，其实就看了群主提供命令那句话的意思。

sunxi boot镜像烧写
~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell
    
   sudo dd if=u-boot-sunxi-with-spl.bin of=/dev/sdb bs=1024 seek=8
   sudo sync

bs代表一次写入多大的块，（blocksize的缩写），if参数为下载的镜像的路径（应该是input file缩写），of后参数为设备地址（应该是output file的缩写），sync是同步数据的意思，加了sync，那么dd写的东西会直接写入你的/dev/sdb设备中，不加的话可能会先缓存一下。加了sync保障数据完整性
命令准备好了，然而还不知道sd卡挂载名 好吧 继续命令：``ls /dev/sd×`` 插不插sd卡可以看出有什么新设备，``df -h`` 命令也可以，可以看看有什么不同。找到设备写入上面的 ``u-boot-sunxi-with-spl.bin``

SD卡分区
~~~~~~~~~~~~~~~~~~~~

下一步就是linux内核镜像了，需要给sd分区，自行学习linux分区命令 fdisk，另外参考了群主的shell命令脚本，虽然没有备注，帮助还是很大的，首先是clear_partion.sh，清除sd卡分区。然后是 ``write_partion.sh``，新建两个分区 第一分区16M，第二分区系统默认。``write_mkfs.sh``，格式化第一分区为fat，格式化地二分区为ext4。

内核镜像
~~~~~~~~~~~~~~~~~~~~

分区准备好了就要往里写文件啦，，，文件也需要自行转化下，呃，fex2bin ，怎么找不到呢，怎么找不到呢，，，继续百度，，原来还得编译sunxi-tools，幸好之前把这些文件都准备好了，，直接make得到fex2bin，用命令 ``./fex2bin a13-lichee.fex script.bin``
得到script.bin二进制配置文件。摄像头字段先不改了，主要还不知道改哪里。
按群主提示： ``mkimage -C none -A arm -T script -d boot.cmd boot.scr`` 得到boot.scr
好吧这三个文件终于全了，还是根据群主的shell命令脚本提示把这三个文件搞进去。

根文件系统烧写
~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

   dd if=fs2.img of=/dev/sdb2 bs=64K
   sync

这个命令敲完回车后可能要等五六分钟，，不要以为死机了啊，我差点就等不及关了。

启动啦
~~~~~~~~~~~~~~~~~~~~

sd卡现在准备好了，插卡准备启动吧，插卡上电，，，屏幕出现一大堆信息，看不过来，不过最后貌似启动成功了，，wifi OK ！后边还有两个错误USBA ERR！/OTG detect ERR！好吧 linux下的串口我还不会用，，，度了后知道有个minicom的东西。
好吧继续学习怎么配置minicom，这东东竟然需要root权限，我的是usb转串口

.. code-block:: irc

    Welcome to minicom 2.7
    OPTI+-----------------------------------------------------------------------+
    Comp| A - Serial Device : /dev/ttyUSB0  |
    Port| B - Lockfile Location : /var/lock |
        | C - Callin Program :              |
    Pres| D - Callout Program :             |
        | E - Bps/Par/Bits : 115200 8N1     |
        | F - Hardware Flow Control : No    |
        | G - Software Flow Control : No    |
        |                                   |
        | Change which setting?             |

也就这样了。重启系统打印了好长一串东西，，，群文件有正常启动的log信息。
启动完了，启动完了，还能干啥？？？
启动完成后，按一下键盘回车，荔枝派串口打印： ``root@Lichee:~#``
到此成功了。。。下一步就是进入桌面系统了。。。我也没进去呢，哈哈哈