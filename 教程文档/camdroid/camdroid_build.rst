camdriod编译过程走读
============================

camdroid编译
----------------------------

.. code-block:: shell

    source build/envsetup.sh	#导入环境变量设置，如下面的这些命令
    lunch	#选择平台型号，在build/envsetup.sh，包含了device/softwinner/common/vendorsetup.sh
    mklichee	#编译BootLoader和内核，模块
    extract-bsp	#拷贝前面的结果
    make -j12	#编译camdroid
    pack		#打包镜像

lichee编译
----------------------------

mklichee在device/softwinner/common/vendorsetup.sh里：

.. code-block:: shell

    function mklichee()
    {
        mksetting
        mk_info "build lichee ..."
            mkbr && mkkernel
    #    mkbr && mkkernel && mkuboot
        [ $? -ne 0 ] && return 1
            return 0
    }

mksetting打印配置信息
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    function mksetting()
        {
            printf "\n"
            printf "mkscript current setting:\n"
            printf "        Chip: ${LICHEE_CHIP}\n"
            printf "    Platform: ${LICHEE_PLATFORM}\n"
            printf "       Board: ${LICHEE_BOARD}\n"
            printf "  Output Dir: ${LICHEE_PLAT_OUT}\n"
            printf "\n"
        }

::

    实际打印结果：
    > mkscript current setting:
    > Chip: sun8iw8p1
    > Platform:
    > Board:
    > Output Dir: /home/zp/develop/lichee_git/lichee_zero/camdroid/../lichee/out/sun8iw8p1/linux/common

mkbr编译buildroot
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    function mkbr()
    {
        mk_info "build buildroot ..."
        local build_script
        build_script="scripts/build.sh"
            LICHEE_PLATFORM="linux"

        (cd ${LICHEE_BR_DIR} && [ -x ${build_script} ] && ./${build_script} "buildroot" ${LICHEE_PLATFORM} ${LICHEE_CHIP})
        [ $? -ne 0 ] && mk_error "build buildroot Failed" && return 1
        mk_info "build buildroot OK."
    }

执行结果：

::

    INFO: build buildroot ...
    external toolchain has been installed
    INFO: build buildroot OK.

.. tip:: export LICHEE_BR_DIR=${LICHEE_DIR}/buildroot

所以先进入lichee/buildroot，
-x表示进入跟踪模式，执行 ``scripts/build.sh``，这里是导入了一些路径变量

.. code-block:: shell

    EXTERNAL_DIR=${LICHEE_BR_DIR}/external-packages
    DESTDIR=${LICHEE_BR_DIR}/images
    STAGING_DIR=${LICHEE_BR_OUT}/staging
    INCDIR=${STAGING_DIR}/usr/include
    TARGET_DIR=${LICHEE_BR_OUT}/target
    TARGET_SYSROOT_OPT="--sysroot=${STAGING_DIR}"

然后执行 ``./${build_script} "buildroot" ${LICHEE_PLATFORM} ${LICHEE_CHIP}``
也就是： ``./scripts/build.sh "buildroot" linux sun8iw8p1``
解析命令里没有对后面的参数进行解析。。

.. code-block:: shell

    case "$1" in
        clean)
            rm -rf ${LICHEE_BR_OUT}
            ;;
        *)
            if [ "x${LICHEE_PLATFORM}" = "xlinux" ] ; then	#根本没有对这个赋值
                build_buildroot
                export PATH=${LICHEE_BR_OUT}/external-toolchain/bin:$PATH
                build_external
            else
                build_toolchain
            fi
            ;;
    esac

这里执行了后面的else，也就是build_toolchain(其实是解压外部工具链)

.. code-block:: shell

    build_toolchain()
    {
        local tooldir="${LICHEE_BR_OUT}/external-toolchain"
        mkdir -p ${tooldir}		#out/sun8iw8p1/linux/common/buildroot/external-toolchain
        if [ -f ${tooldir}/.installed ] ; then
            printf "external toolchain has been installed\n"
        else
            printf "installing external toolchain\n"
            printf "please wait for a few minutes ...\n"
            tar --strip-components=1 \
                -jxf ${LICHEE_BR_DIR}/dl/gcc-linaro.tar.bz2 \
                -C ${tooldir}
            [ $? -eq 0 ] && touch ${tooldir}/.installed
        fi
        export PATH=${tooldir}/bin:${PATH}
    }

简单地说就是把 ``buildroot/dl/gcc-linaro.tar.bz2`` 解压到 ``out/sun8iw8p1/linux/common/buildroot/external-toolchain``

另一路选择执行的两个函数：

.. code-block:: shell

    build_buildroot()	//编译buildroot
    {
        if [ ! -f ${LICHEE_BR_OUT}/.config ] ; then		#如果没有配置过，则使用默认配置
            printf "\nUsing default config ...\n\n"
            make O=${LICHEE_BR_OUT} -C ${LICHEE_BR_DIR} ${LICHEE_BR_DEFCONF}
        fi

        make O=${LICHEE_BR_OUT} -C ${LICHEE_BR_DIR} LICHEE_GEN_ROOTFS=n \
            BR2_JLEVEL=${LICHEE_JLEVEL}
    }

    build_external()			//external-packages,指buildroot里的所有外部包
    {
        for dir in ${EXTERNAL_DIR}/* ; do
            if [ -f ${dir}/Makefile ]; then
                BUILD_COMMAND="make -C ${dir} ${BUILD_OPTIONS} all"
                eval $BUILD_COMMAND
                BUILD_COMMAND="make -C ${dir} ${BUILD_OPTIONS} install"
                eval $BUILD_COMMAND
            fi
        done
    }

即执行了： ``make O=out/sun8iw8p1/linux/common/buildroot -C ./ LICHEE_GEN_ROOTFS=n BR2_JLEVEL=${LICHEE_JLEVEL}``

即编译br目录，但不生成rootfs

mkkernel编译内核
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    function mkkernel()
    {
            local platformdef=$tdevice

            if [ ! -n $tdevice ]; then
                    echo "Please lunch device"
                    return 1
            fi

            echo "Make the kernel"  
            echo "platformdef="${platformdef}
            (cd ${LICHEE_KERN_DIR}/; ./build.sh -p ${platformdef})
            [ $? -ne 0 ] && mk_error "build mkkernel fail" && return 1
            echo "Make the kernel finish"
            return 0
    }

执行显示结果：

::

    Make the kernel
    platformdef=tiger-cdr

即执行了： ``cd lichee/linux3.4; ./build.sh -p tiger-cdr``

.. code-block:: shell

    #这里首先导入了PLATFORM=tiger-cdr
    while getopts hp:m: OPTION
    do
            case $OPTION in
            h) show_help
            ;;
            p) PLATFORM=$OPTARG
            ;;
            m) MODULE=$OPTARG
            ;;
            *) show_help
            ;;
    esac
    done

    #没有指定platform则退出
    if [ -z "$PLATFORM" ]; then
            show_help
            exit 1
    fi

    #没有指定模块则默认编译所有
    if [ -z "$MODULE" ]; then
            MODULE="all"
    fi

    #执行scripts/build_tiger-cdr.sh
    if [ -x ./scripts/build_${PLATFORM}.sh ]; then
            ./scripts/build_${PLATFORM}.sh $MODULE
    else
            printf "\nERROR: Invalid Platform\nonly sun6i sun6i_fiber or sun6i_dragonboard sopport\n"
            show_help
            exit 1
    fi

对应目录里脚本为：

.. code-block:: shell

    LICHEE_ROOT=`(cd ${LICHEE_KDIR}/..; pwd)`
    export PATH=${LICHEE_ROOT}/out/sun8iw8p1/linux/common/buildroot/external-toolchain/bin:${LICHEE_ROOT}/tools/pack/pctools/linux/android:$PATH

    case "$1" in
    kernel)
            build_kernel
            ;;
    modules)
            build_modules
            ;;
    clean)
            clean_kernel
            clean_modules
            ;;
    *)
            build_kernel
            build_modules
    #       build_ramfs   #这里可以生成boot.img
    #       gen_output
            echo -e "\n\033[0;31;1m${LICHEE_CHIP} compile Kernel successful\033[0m\n\n"
            ;;
    esac

总之就是默认编译了内核和模块。。
可以看到build_kernel其实编译了uImage和modules，并把bImage和zImage拷到了output目录
把ko文件拷到了 ``lichee/linux-3.4/output/lib/modules/3.4.39`` 下

.. code-block:: shell

    build_kernel()
    {
            echo "Building kernel"

            cd ${LICHEE_KDIR}

            rm -rf output/
            echo "${LICHEE_MOD_DIR}"
            mkdir -p ${LICHEE_MOD_DIR}
    #       echo "build_kernel LICHEE_KERN_DEFCONF" ${LICHEE_KERN_DEFCONF}
            # We need to copy rootfs files to compile kernel for linux image
    #       cp -f rootfs.cpio.gz output/

        if [ ! -f .config ] ; then
    #        printf "\n\033[0;31;1mUsing default config ${LICHEE_KERN_DEFCONF} ...\033[0m\n\n"
                    printf "\n\033[0;31;1mUsing default config sun8iw8p1smp_tiger_cdr_defconfig ...\033[0m\n\n"
    #        cp arch/arm/configs/${LICHEE_KERN_DEFCONF} .config
                    cp arch/arm/configs/sun8iw8p1smp_tiger_cdr_defconfig .config
        fi

        make ARCH=arm CROSS_COMPILE=${CROSS_COMPILE} -j${LICHEE_JLEVEL} uImage modules

            update_kern_ver

            #The Image is origin binary from vmlinux.
            cp -vf arch/arm/boot/Image output/bImage
            cp -vf arch/arm/boot/[zu]Image output/

            cp .config output/

            tar -jcf output/vmlinux.tar.bz2 vmlinux

            if [ ! -f ./drivers/arisc/binary/arisc ]; then
                    echo "arisc" > ./drivers/arisc/binary/arisc
            fi
            cp ./drivers/arisc/binary/arisc output/

            for file in $(find drivers sound crypto block fs security net -name "*.ko"); do
                    cp $file ${LICHEE_MOD_DIR}
            done
            cp -f Module.symvers ${LICHEE_MOD_DIR}

    }

build_modules部分就没做事了

mkuboot编译uboot
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

（这部分代码没有放出）

.. code-block:: shell

    function mkuboot()
    {
            (cd ${LICHEE_UBOOT_DIR}; ./build.sh -p sun8iw8p1_nor)
            [ $? -ne 0 ] && echo "build u-boot Failed" && return 1
            (cd ${LICHEE_UBOOT_DIR}; ./build.sh -p sun8iw8p1)
            [ $? -ne 0 ] && echo "build u-boot Failed" && return 1
        return 0
    }

extract-bsp
------------------------------

拷贝zimage和modules

.. code-block:: shell

    CURDIR=$PWD
    cd $DEVICE
    
    #extract kernel
    if [ -f kernel ]; then
            rm kernel
    fi
    cp  -rf $LICHEE_KERN_OUTDIR/zImage kernel
    echo "$DEVICE/zImage copied!"
    
    #extract linux modules
    if [ -d modules ]; then
            rm -rf modules
    fi
    mkdir -p modules/modules
    cp -rf $LINUXOUT_MODULE_DIR modules/modules
    echo "$DEVICE/modules copied!"
    chmod 0755 modules/modules/*
    
    cd $CURDIR

pack打包镜像
-------------------------------

.. code-block:: shell

    function pack()
    {
            if [ "-d" == $1 ]; then
                    echo "pack card"
                    pack_card
            else
                    echo "pack_normal"
                    pack_normal
            fi

            return 0
    }
    function pack_normal()
    {
            local platformdef=$tdevice
        echo "Pack to image........." ${platformdef}

        export CAMLINUX_IMAGE_OUT="$CAMLINUX_BUILD_TOP/out/target/product/${platformdef}"
            if [ "tiger-ipc" == ${platformdef} ]; then
            echo "copy tiger-ipc uboot bin files"
                    cp -rf   ${LICHEE_TOOLS_DIR}/pack/chips/sun8iw8p1/configs/tiger-ipc/bin    ${LICHEE_TOOLS_DIR}/pack/chips/sun8iw8p1/
            fi
            (cd ${LICHEE_TOOLS_DIR}/pack; ./pack -c sun8iw8p1 -p camdroid -b ${platformdef} )
            [ $? -ne 0 ] && echo "pack Failed" && return 0
        return 0
    }

    function pack_card()
    {
    ...
    (cd ${LICHEE_TOOLS_DIR}/pack; ./pack -c sun8iw8p1 -p camdroid -b ${platformdef} -d card0 )
    ...
    }

打包过程：

``./pack -c sun8iw8p1 -p camdroid -b ${platformdef}``

.. code-block:: shell

    do_prepare
    do_common
    echo "CAMLINUX_IMAGE_OUT="${CAMLINUX_IMAGE_OUT}
    do_pack_${PACK_PLATFORM}
    do_finish

do_prepare
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    tools_file_list=(
    common/tools/split_xxxx.fex
    chips/${PACK_CHIP}/tools/split_xxxx.fex
    common/tools/usbtool_test.fex
    chips/${PACK_CHIP}/tools/usbtool_test.fex
    common/tools/cardscript.fex
    chips/${PACK_CHIP}/tools/cardscript.fex
    common/tools/cardtool.fex
    chips/${PACK_CHIP}/tools/cardtool.fex
    common/tools/usbtool.fex
    chips/${PACK_CHIP}/tools/usbtool.fex
    common/tools/aultls32.fex
    chips/${PACK_CHIP}/tools/aultls32.fex
    common/tools/aultools.fex
    chips/${PACK_CHIP}/tools/aultools.fex
    )

    configs_file_list=(
    common/toc/toc1.fex
    common/toc/toc0.fex
    common/imagecfg/image_linux.cfg
    common/partition/sys_partition_dump.fex
    common/partition/sys_partition_private.fex
    chips/${PACK_CHIP}/configs/default/*
    chips/${PACK_CHIP}/configs/${PACK_BOARD}/*.fex
    chips/${PACK_CHIP}/configs/${PACK_BOARD}/*.cfg
    )

    boot_resource_list=(
    chips/${PACK_CHIP}/boot-resource/boot-resource:out/
    chips/${PACK_CHIP}/boot-resource/boot-resource.ini:out/
    chips/${PACK_CHIP}/configs/${PACK_BOARD}/bootlogo.bmp:out/boot-resource/
    )

    boot_file_list=(
    chips/${PACK_CHIP}/bin/boot0_nand_${PACK_CHIP}.bin:out/boot0_nand.fex
    chips/${PACK_CHIP}/bin/boot0_sdcard_${PACK_CHIP}.bin:out/boot0_sdcard.fex
    chips/${PACK_CHIP}/bin/boot0_spinor_${PACK_CHIP}.bin:out/boot0_spinor.fex
    chips/${PACK_CHIP}/bin/fes1_${PACK_CHIP}.bin:out/fes1.fex
    chips/${PACK_CHIP}/bin/u-boot-${PACK_CHIP}.bin:out/u-boot.fex
    chips/${PACK_CHIP}/bin/u-boot-spinor-${PACK_CHIP}.bin:out/u-boot-spinor.fex
    )

    boot_file_secure=(
    chips/${PACK_CHIP}/bin/semelis.bin:out/semelis.bin
    chips/${PACK_CHIP}/bin/sboot_${PACK_CHIP}.bin:out/sboot.bin
    )

    function do_prepare()
    {
    ...
        # Cleanup
        rm -rf out/
        mkdir -p out/

        printf "copying tools file\n"
        for file in ${tools_file_list[@]} ; do
            cp -f $file out/ 2> /dev/null
        done
    ...
    #拷贝各种fex到out下，包含开机画面等

do_common
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

转换格式，通过fex更新boot

.. code-block:: shell

    function do_common()
    {
        cd out/
        
        busybox unix2dos sys_config.fex
        busybox unix2dos sys_partition.fex
        script  sys_config.fex > /dev/null
        script  sys_partition.fex > /dev/null
        cp -f   sys_config.bin config.fex

        if [ "x${PACK_PLATFORM}" = "xdragonboard" ] ; then
            busybox dos2unix test_config.fex
            cp test_config.fex boot-resource/
            busybox unix2dos test_config.fex
            script test_config.fex > /dev/null
            cp test_config.bin boot-resource/
        fi

        # Those files for SpiNor. We will try to find sys_partition_nor.fex
        if [ -f sys_partition_nor.fex -o \
            -f sys_partition_nor_${PACK_PLATFORM}.fex ];  then

            mv -f sys_partition_nor_${PACK_PLATFORM}.fex \
                sys_partition_nor.fex >/dev/null 2>&1

            # Here, will create sys_partition_nor.bin
            busybox unix2dos sys_partition_nor.fex
            script  sys_partition_nor.fex > /dev/null
            update_boot0 boot0_spinor.fex   sys_config.bin SDMMC_CARD > /dev/null
            update_uboot u-boot-spinor.fex  sys_config.bin >/dev/null
        fi

        # Those files for Nand or Card
        update_boot0 boot0_nand.fex	sys_config.bin NAND > /dev/null
        update_boot0 boot0_sdcard.fex	sys_config.bin SDMMC_CARD > /dev/null
        update_uboot u-boot.fex  		sys_config.bin > /dev/null
        update_fes1  fes1.fex			sys_config.bin > /dev/null
        fsbuild	     boot-resource.ini  split_xxxx.fex > /dev/null

        if [ "x${PACK_FUNC}" = "xprvt" ] ; then
            u_boot_env_gen env_burn.cfg env.fex > /dev/null
        else
            u_boot_env_gen env.cfg env.fex > /dev/null
        fi

        if [ -f "$LICHEE_OUT/arisc" ]; then
            ln -s $LICHEE_OUT/arisc arisc.fex
        fi
    }

do_pack_${PACK_PLATFORM}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    function do_pack_android()
    {
        printf "packing for android\n"

        if [ -z "${ANDROID_IMAGE_OUT}" ] ; then
            pack_error "please specify ANDROID_IMAGE_OUT env"
            exit 1
        fi

        ln -s ${ANDROID_IMAGE_OUT}/boot.img boot.fex
        ln -s ${ANDROID_IMAGE_OUT}/system.img system.fex
        ln -s ${ANDROID_IMAGE_OUT}/recovery.img recovery.fex

        if [ -f ${ANDROID_IMAGE_OUT}/userdata.img ] ; then
            ln -s ${ANDROID_IMAGE_OUT}/userdata.img userdata.fex
        fi

        if [ "x${PACK_SIG}" = "xsig" ] ; then
            echo "signature sunxi mbr"
            signature sunxi_mbr.fex dlinfo.fex
            echo "signature over"
        elif [ "x${PACK_SIG}" = "xsecure" ] ; then
            do_signature
        else
            echo "normal"
        fi
    }

    function do_pack_camdroid()
    {
        printf "packing for camdroid\n"

        if [ -z "${CAMLINUX_IMAGE_OUT}" ] ; then
            pack_error "please specify CAMLINUX_IMAGE_OUT env"
            exit 1
        fi
        ln -s ${CAMLINUX_IMAGE_OUT}/boot.img boot.fex
        ln -s ${CAMLINUX_IMAGE_OUT}/system.img rootfs.fex	#使用前面打包的system.img作为根文件系统
    }
    function do_pack_dragonboard()
    {
        printf "packing for dragonboard\n"

        ln -s ${LICHEE_OUT}/boot.img boot.fex
        ln -s ${LICHEE_OUT}/rootfs.ext4 rootfs.fex
    }
    function do_pack_linux()
    {
        printf "packing for linux\n"
    #输出目录是linux-3.4/output/
        ln -s ${LICHEE_OUT}/vmlinux.tar.bz2 vmlinux.fex
        ln -s ${LICHEE_OUT}/boot.img        boot.fex	#
        ln -s ${LICHEE_OUT}/rootfs.ext4 rootfs.fex

        if [ "x${PACK_SIG}" = "xsecure" ] ; then
            do_signature
        else
            echo "normal"
        fi
    }

do_finish
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    function do_finish()
    {
        # Yeah, it should contain all files into full_img.fex for spinor
        # Because, as usually, spinor image size is very small.
        # If fail to create full_img.fex, we should fake it empty.

        # WTF, it is so ugly! It must be sunxi_mbr.fex, not sunxi_mbr_xxx.fex
        # Check whether sys_partition_nor.bin is exist, and create sunxi_mbr.fex
        # for Nor.
        if [ -f sys_partition_nor.bin ]; then 
            mv -f sys_partition.bin         sys_partition.bin_back
            cp -f sys_partition_nor.bin     sys_partition.bin
            update_mbr                      sys_partition.bin 1 > /dev/null

            merge_package full_img.fex      boot0_spinor.fex \
                u-boot-spinor.fex sunxi_mbr.fex sys_partition.bin

            mv -f sys_partition.bin_back    sys_partition.bin
        fi
        if [ ! -f full_img.fex ]; then
            echo "full_img.fex is empty" > full_img.fex
        fi

        update_mbr          sys_partition_nor.bin 1 > /dev/null
        dragon image.cfg    sys_partition_nor.fex

        if [ -e ${IMG_NAME} ]; then
            mv ${IMG_NAME} ../${IMG_NAME}
            echo '----------image is at----------'
            echo -e '\033[0;31;1m'
            echo ${ROOT_DIR}/${IMG_NAME}
            echo -e '\033[0m'
        fi

        cd ..
        printf "pack finish\n"
    }

打包完成后的布局
---------------------------------

::

    Device Boot         Start         End      Blocks   Id  System
    /dev/sdf1           56992     1939454      941231+   b  W95 FAT32
    /dev/sdf2   *       40992       46111        2560    6  FAT16
    /dev/sdf3               1       56992       28496   85  Linux extended
    /dev/sdf5           46112       55199        4544   83  Linux
    /dev/sdf6           55200       56223         512   83  Linux
    /dev/sdf7           56224       56479         128   83  Linux
    /dev/sdf8           56480       56735         128   83  Linux
    /dev/sdf9           56736       56863          64   83  Linux
    /dev/sdf10          56864       56991          64   83  Linux

配置里的分区表：

::

    [partition]
        name         = boot
        size         = 5120
        downloadfile = "boot.fex"	#内核ramfs
    [partition]
        name         = system
        size         = 9088
        downloadfile = "rootfs.fex"	#根文件系统
    [partition]
        name         = cfg
        size         = 1024
        downloadfile = "cfg.fex"	#jffs2的cfg，用于保存可变的配置字段
    [partition]
        name         = boot_logo
        size         = 256
        downloadfile = "boot_logo.fex"
    [partition]
        name         = shutdown_logo
        size         = 256
        downloadfile = "shutdown_logo.fex"
    [partition]
        name         = env
        size         = 128
        downloadfile = "env.fex"	#uboot启动的环境变量
    [partition]
        name         = private
        size         = 128

cfg.fex的生成
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``device/softwinner/tiger-cdr/res/make_cfg_fex.sh``

.. code-block:: shell

    CFG_PATH="/pack/chips/sun8iw8p1/configs/CDR/cfg.fex"
    DEST=$LICHEE_TOOLS_DIR$CFG_PATH

    echo "./mkfs.jffs2 -d ./data -o cfg.fex"
    #-p total size
    ./mkfs.jffs2 -d ./cfg -p 0x80000 -o cfg.fex

    echo "move cfg.fex to $DEST"
    mv cfg.fex $DEST

boot.fex(boot.img)生成
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: shell

    INSTALLED_BOOTIMAGE_TARGET := $(PRODUCT_OUT)/boot.img
    $(INSTALLED_BOOTIMAGE_TARGET): $(MKBOOTIMG) $(INTERNAL_BOOTIMAGE_FILES)
            $(call pretty,"Target boot image: $@")
            $(hide) $(MKBOOTIMG) $(INTERNAL_BOOTIMAGE_ARGS) $(BOARD_MKBOOTIMG_ARGS) --output $@
            $(hide) $(call assert-max-image-size,$@,$(BOARD_BOOTIMAGE_PARTITION_SIZE),raw)

.. code-block:: shell

    regen_rootfs_cpio()
    {
            echo "regenerate rootfs cpio"

            cd ${LICHEE_KDIR}/output
            echo "###"
            if [ -x "../scripts/build_rootfs.sh" ]; then
                    ../scripts/build_rootfs.sh e ./rootfs.cpio.gz > /dev/null
            else
                    echo "No such file: scripts/build_rootfs.sh"
                    exit 1
            fi
            echo "###"

            mkdir -p ./skel/lib/modules/${KERNEL_VERSION}
            echo "###"

            if [ -e ${LICHEE_MOD_DIR}/nand.ko ]; then
                    cp ${LICHEE_MOD_DIR}/nand.ko ./skel/lib/modules/${KERNEL_VERSION}
                    if [ $? -ne 0 ]; then
                            echo "copy nand module error: $?"
                            exit 1
                    fi
            fi
            echo "###ttt"

            ko_file=`find ./skel/lib/modules/$KERNEL_VERSION/ -name *.ko`
            if [ ! -z "$ko_file" ]; then
                    ${STRIP} -d ./skel/lib/modules/$KERNEL_VERSION/*.ko
            fi
            echo "###ttt"

            rm -f rootfs.cpio.gz
            ../scripts/build_rootfs.sh c rootfs.cpio.gz > /dev/null
            rm -rf skel
            echo "###ttt"
            
            cd - > /dev/null
    }

.. tip:: TARGET_ROOT_OUT := $(PRODUCT_OUT)/$(TARGET_COPY_OUT_ROOT)

修改配置生成linux镜像
-----------------------------------------

由上面的走读可知，需要生成boot分区，linux根文件系统分区，及对应的分区表

内核配置：
``linux-3.4/arch/arm/configs/sun8iw8p1smp_defconfig``
``linux-3.4/arch/arm/configs/sun8iw8p1smp_tiger_cdr_defconfig``

配置内核：
``make ARCH=arm menuconfig``

板级配置和开机logo
``ls tools/pack/chips/sun8iw8p1/configs/tiger-cdr/``

``boot-resource cfg.fex sys_config.fex sys_partition_nor_camdroid.fex``
