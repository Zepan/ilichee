# Ubuntu 16.04编译过程踩坑记录

## 前言

虽然ilichee推荐的环境为Ubuntu 14.04，但是由于Ubuntu官方发布了新版LTS，即16.04。冒着踩坑的风险采用了新发型版。16.04默认的GCC版本为GCC-5，接下来会分别说一下采用GCC-4.7编译和GCC-5编译的过程。

---

## 采用GCC-4.7

**推荐采用GCC-4.7版本，因为ilichee作者即采用的此版本，以后利于协作和排错，出现的问题可能因为采用不同版本的GCC而有差异**

由于系统默认为GCC-5，所以首先下载GCC-4.7相关依赖包

```shell

sudo apt install gcc-4.7 g++-4.7 \
gcc-4.7-multilib gcc g++-4.7-multilib \
gcc-4.7-arm-linux-gnueabihf g++-4.7-arm-linux-gnueabihf

```

然后配置系统默认GCC版本

```shell

sudo update-alternatives \
--install /usr/bin/arm-linux-gnueabihf-gcc arm-linux-gnueabihf-gcc /usr/bin/arm-linux-gnueabihf-gcc-5 10 \
--slave /usr/bin/arm-linux-gnueabihf-g++ arm-linux-gnueabihf-g++ /usr/bin/arm-linux-gnueabihf-g++-5 \
--slave /usr/bin/arm-linux-gnueabihf-gcov arm-linux-gnueabihf-gcov /usr/bin/arm-linux-gnueabihf-gcov-5

sudo update-alternatives \
--install /usr/bin/arm-linux-gnueabihf-gcc arm-linux-gnueabihf-gcc /usr/bin/arm-linux-gnueabihf-gcc-4.7 20 \
--slave /usr/bin/arm-linux-gnueabihf-g++ arm-linux-gnueabihf-g++ /usr/bin/arm-linux-gnueabihf-g++-4.7 \
--slave /usr/bin/arm-linux-gnueabihf-gcov arm-linux-gnueabihf-gcov /usr/bin/arm-linux-gnueabihf-gcov-4.7

sudo update-alternatives \
--install /usr/bin/gcc gcc /usr/bin/gcc-5 10 \
--slave /usr/bin/g++ g++ /usr/bin/g++-5

sudo update-alternatives \
--install /usr/bin/gcc gcc /usr/bin/gcc-4.7 20 \
--slave /usr/bin/g++ g++ /usr/bin/g++-4.7

```

查看默认版本，查看是否指向了`/usr/bin/gcc-4.7`和`arm-linux-gnueabihf-gcc-4.7`

```shell

sudo update-alternatives --display gcc
sudo update-alternatives --display arm-linux-gnueabihf-gcc

```

确认无误后按官方教程操作即可。

---

##采用GCC-5

首先将GCC版本切换回GCC-5

```shell

sudo update-alternatives --config gcc

sudo update-alternatives --config arm-linux-gnueabihf-gcc

```

然后下载用GCC-5编译的补丁

<https://github.com/linux-sunxi/meta-sunxi/raw/master/recipes-kernel/linux/linux-sunxi/0001-compiler-gcc5.patch>

<https://github.com/linux-sunxi/meta-sunxi/raw/master/recipes-kernel/linux/linux-sunxi/0001-gcc5-fixes.patch>

<https://github.com/archlinuxarm/PKGBUILDs/raw/master/core/linux-parallella/0002-ARM-8158-1-LLVMLinux-use-static-inline-in-ARM-ftrace.patch>

*注：第三个补丁没有采用 <https://github.com/linux-sunxi/meta-sunxi/raw/master/recipes-kernel/linux/linux-sunxi/0002-use-static-inline-in-ARM-ftrace.patch> 因为不知原因我的打不上*

最后应用补丁

```shell

git apply 0001-compiler-gcc5.patch

git apply 0001-gcc5-fixes.patch

git apply 0002-ARM-8158-1-LLVMLinux-use-static-inline-in-ARM-ftrace.patch

```

确认无误后按官方教程操作即可。*注：编译过程中会出现很多警告，因为板子没到手，不知实际运行时是否会出现问题*