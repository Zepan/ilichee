
##前言
  ilichee作者推荐采用环境为14.04，但是为了尝鲜,跟ming42网友一样采用了最新的16.04，编译过程中自然会少不了掉进坑里，在参考ming42的文章和google的帮助下终于编译uboot成功，遇到的问题不难，但是对于新手来说还是要费一番功夫查，这里简单说一下。（PS:第一次采用MD，这里“照抄”了不少ming42兄的排版，希望不要介意）

---
##无法安装mingw32问题
按照ilichee作者的教程构建编译开发环境，安装依赖包时会出现下面的问题
> E:无法定位软件包mingw32

出现此问题是因为在Ubuntu16.04和Ubuntu14.04的依赖不同，这里需要采用mingw-w64
```shell
sudo apt-get install mingw-w64
```
##提示GCC编译器问题
此问题是因为作者采用GCC-4.7版，Ubuntu16.04 默认采用GCC-5，建议采用GCC-4.7，具体解决方法请参考ming42网友的文章——编译坑_Ubuntu 16.04编译过程踩坑记录
<https://github.com/Zepan/ilichee/tree/master/那些年我们踩的坑>

##提示dtc更新
最后一步编译过程中可能提示
>  Your dtc is too old, please upgrade to dtc 1.4 or newer

dtc是device-tree-compiler的缩写，即设备树编译器，当其版本太老时便无法继续编译，更新即可
```
sudo apt-get install device-tree-compiler
```
