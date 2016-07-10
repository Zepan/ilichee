# linux镜像编译 #
在lichee目录下：
```
./build.sh -p a13_nuclear -k 3.0 //编译安卓的linux内核  
./build.sh -p  a13_dragonboard -k 3.0//编译龙板  
./build.sh pack //打包  
```

# 编译安卓镜像 #
首先要安装jdk，该版本安卓只支持到jdk1.6,请设置当前jdk版本到1.6
```
update-alternatives --config java      //设置Java版本
source build/envsetup.sh
lunch   //选择板子
extract-bsp
time make -j12 2>&1  | tee log.txt	//这里-j12设置成你电脑的线程数
pack     //打包整个固件
```

如果报非法参数的错，可能是linux内核和andriod两边没对上，可以在  
lichee\tools\pack\chips\sun5i\configs\android 里修改下对应配置文件的名字再重新pack
