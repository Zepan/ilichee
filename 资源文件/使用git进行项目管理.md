# 使用git进行项目管理

------

- git与github简介
- git工作流程
- 建立本地目录
- git各种操作

------
##Git与Github简介
>* Git是一种版本控制系统,是一种记录若干文件内容变化，以便将来查阅特定版本修订情况的系统。它具有极为丰富的命令集，对内部系统提供了高级操作和完全访问。Git诞生于2005年，由Linux开源社区（特别是Linux的缔造者Linus Torvalds）开发。
Git 的特点：
－ 支持离线开发，离线仓库(Repository)
－ 强大的分支功能，适合多个独立开发者协作
－ 速度块

>* Github是一个网站，给用户提供git服务。 这样你就不用自己部署git系统，直接用注册个账号，用他们提供的git服务就可以。所以只要到[www.github.com](https://www.github.com)申请一个github帐号，就可以免费使用git服务。

Github将每一个项目称作一个`“仓库”(repository)`,在仓库里，你可以自由地添加、同步、删除文件，而且可以多人协作对一个仓库中的文件进行修改。横向上，github采用`工作流`的方式，你的本地仓库由git维护的三棵“树”组成。第一个是你的工作目录，它持有实际文件；第二个是暂存区（Index），它像个缓存区域，临时保存你的改动；最后是HEAD，它指向你最后一次提交的结果；纵向上，github采用主干-分支的流程控制方式，采用多分支实现单人多作和多人协作，可以方便地找回任何一个修改节点的记录。
本文主要介绍如何使用git进行合作项目管理，希望之前没有接触过`git`和`github`的朋友可以通过这篇介绍对如何使用git有一定的了解。
另外，如果需要像本文一样进行`Markdown`文本格式编辑，需要使用相应的Markdown格式；涉及到在`vim`编辑器中进行代码或文本的修改，需要了解一些vim相关的使用命令。这些我就不再一一叙述，如果还不会的可以自行查阅网上相关资料进行学习。下面开始正题：
***

##Git工作流程简介
- [x] 复制代码库
- [x] 建立目录
- [x] 加载文件(stage)
- [x] 提交文件(commit)
- [x] 创建分支(branch)
- [x] 合并分支(merge)
- [x] 丢弃分支
- [x] 删除分支(delete)
- [x] 回滚到之前的提交状态(back)
- [x] 复制和推送请求(fork/pull request)
- [x] 推送到远程代码库(push)
- [x] 取得远程代码库的拷贝(pull)
- [x] 更多······

首先，你需要去github上将别人的代码库**`复制`**到自己的库中，也可以先在自己的电脑上**`建立目录`**，相当于自己的个人站点，对应着github服务器上的站点。接下来，你可以在这个目录下进行创建新文件、修改文件等等操作，修改完之后，就需要**`加载文件`**，也就是把修改过的文件正式放进自己的项目里。而**`提交文件`**则是把文件上传到github服务器，进行文件同步。接着，我想加入新的代码进行测试，那么就可以**`创建分支`**。建立分支是你创建代码的独立版本的动作，独立于你的主干分支，相当于进入了另外一条“时间河流”。默认情况下，每次你提交到Git的文件都会被储存到主干分支。满意的话将新分支和主干**`合并分支`**，不满意的话“时光倒流”回到主干，并**`删除分支`**。如果发现新增的改动有问题，可以**`回滚到之前的提交状态`**。终于，本地的修改结束，想要上传到github，就可以**`推送到远程代码库`**；相反，如果想把github仓库里的文件下载到本地，可以**`取得远程代码库的拷贝`**。

***

##环境配置
+ 首先，到[https://git-scm.com/download](https://git-scm.com/download)，根据自己的操作系统选择下载对应的客户端（一般linux已经预安装）。下载后安装、打开，进入git界面（即linux命令行界面）。
![图例1](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/70130977.jpg)

+ 然后，我在自己电脑的E盘建立了一个专门用于git操作文件的文件夹，对应着github的站点。在命令行中，去到对应的根文件夹：
```python
姜朝峰@DESKTOP-J5JHQ29 MINGW64 ~
$ cd e:/github/my_site
```
于是打开了根目录，输入ls命令，该目录下还没有文件：
```pyhton
姜朝峰@DESKTOP-J5JHQ29 MINGW64 /e/github/my_site
$ ls
```
<center>![图例1.2](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/41336056.jpg)
图例1.2</center>

+ 接着，在本地创建ssh key，建立和github服务器的连接：
```python
$ ssh-keygen -t rsa -C "your_email@youremail.com"
```
后面的your_email@youremail.com改为在github上注册的邮箱（如图），之后会要求确认路径和输入密码，我们默认一路回车就行。
<center>![图例1.3](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/39717986.jpg)
图例1.3</center>

成功的话会在“C:\Users\XXX”下生成.ssh文件夹，进去并打开id_rsa.pub，复制里面的key。
<center>![图例1.4](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/24543049.jpg)
图例1.4</center>

回到浏览器打开github，进入Settings(配置)，左边选择“SSH and GPG Keys”，点击“New SSH Key”,随便填一下title，粘贴生成的key。


<center>![图例1.5](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/46401981.jpg)
图例1.5</center>

+ 为了验证是否成功，在git bash下输入：
```python
$ ssh -T git@github.com
```
如果出现下图所示的情况，这就表示已成功连上github。如果要多人协作对这个库进行修改，就需要把合作者的SSH KEY都添加到账户列表中。
<center>![图例1.6](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/6612013.jpg)
图例1.6</center>

+ 在我们能用git工作之前，我们需要还做个一次性的用户配置。为了git能跟踪到谁做了修改，我们需要设置用户名和账户。发送下面的命令，相应地替换掉其中的“your_username”和“your_email@server.com”，改成自己的信息：
```python
git config --global user.name "your_username"
git config --global user.email your_email@server.com
```
+ 设置好之后，再输入初始化命令，就把当前目录作为git根目录，创建了一个本地仓库：
```python
git init
```
<center>![图例1.7](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-22/49964901.jpg)
图例1.7</center>

最后出现“Initialized empty Git repository in E:/github/my_site/.git/”的指令，说明git的初始化配置成功。Git会在my_site文件夹内创建一个名为.git的隐藏文件夹，那就是你的本地代码仓库。
如果不进行初始设置，你就无法提交任何东西。设置好之后，下一次打开可以直接工作，不用再设置一次。不过要是换了电脑，那就需要再设置一遍。

我们希望为荔枝Pi的github项目库增加或修改内容，这就涉及到多人一起在github上的开发。一般有三种方法：
>* 第一种：把各位的公钥加到该项目的公钥列表里；
>* 第二种：在github建一个**orgnization**，然后建一个**team**，把大家加到team并把项目放到team下；
>* 第三种：就是你要修改的人**fork**,然后给群主发**pull request**，等群主通过。
第一种上面的环境配置中已经谈到，第二种可以自行到github了解，这里推荐第三种方式。

+ 到此，就完成了git的环境配置，可以开始具体的工作流程。
***

##具体工作流程
下面，我们以windows上的操作步骤为例进行示范（linux类似）。

###**复制代码库**
如果想参与到对别人代码库的修改中，可以先fork再pull request。**fork**就是拷贝别人这个项目代码库到自己帐号下，**pull request**后面会谈到。
比如群主A有一個代码库a(也就是荔枝派的github主页)，B看到觉得不错，所以就**fork**一個到自己的代码库中，叫做b。这时，a和b的修改互不干预，大家可以随意修改。另外，旁边的“Star”表示持续关注别人项目更新，“watch”则是设置接收邮件提醒。
<center>![图例2.13](https://raw.github.com/RubyLouvre/mass-Framework/master/course/4.jpg)
图例2.13</center>

###**加载文件**
我用vim指令创建并保存了text1.txt和markd.md两个文本文件，但它们还没有放入中。现在加载(stage)所有项目文件仓库(repository)，输入：
```python
git add .
```
最后的“.”符号的意思是“所有文件、文件夹和子文件夹”。
<center>![图例2.1](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/38985471.jpg)
图例2.1</center>

假如我们只想要把特定文件添加到源代码控制中去，我们可以指定要添加的文件。比如，我用vim创建了两个markdown文件------README1.md、README2.md，发送：
```python
git add README1.md, README2.md
```	
<center>![图例2.2](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/42005549.jpg)
图例2.2</center>

###**提交文件**

现在，我们想要提交已加载（staged）的文件。提交文件时，我们需要给这个状态一个备注，所以我们提交我们的文件时，总是附带着有意义的注释，描述了它们现在的状态。比如用“first commit”来作为第一个提交的注释，如下：
```python
git commit -m "first commit"
```	
<center>![图例2.3](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/37236592.jpg)
图例2.3</center>

但发现至提交了3个文件，检查可知我把其中一个文件README2.md打成了README2.MD，修改后重复上面的操作即可。
这样我们就用“first commit”代表这个时间点提交的修改，后面还可以再回滚到这个提交状态。
提交之后，如果你想查看现在已加载、未加载的文件及状态，可以用以下命令：
```python
git status
```	
<center>![图例2.4](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/10794292.jpg)
图例2.4</center>

###**创建分支**

如果要写或者测试新的部分，还不想直接加入到程序中时，就可以创建分支，就像暂时踏入另一条时间的河流一样。建立分支是你创建代码的独立版本，独立于你的主干分支。默认情况下，每次你提交到Git的文件都会被储存到“master（主干）”分支。
创建并同时切换到你新建的分支，发送：
```python
git checkout -b new_feature
```	
<center>![图例2.5](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/37239574.jpg)
图例2.5</center>

或者，你可以先创建一个分支然后手动切换，输入命令：
```python
git branch new_featuregit checkout new_feature
```	
要看你现在项目下所有的分支，输入如下指令：
```python
git branch
```	
<center>![图例2.6](http://7xrn7f.com1.z0.glb.clouddn.com/16-8-23/54073796.jpg)
图例2.6</center>

现在你可以在你的项目上无所顾忌地做任何你想做的：任何时候，你都可以回到你创建分支前的状态。你同时可以有多个分支，甚至可以从一个分支上再创建一个分支。
 
###**合并分支**

现在我在新的分支new_feature做一些修改，比如删除了README2.md。
<center>![图例2.7](http://ww3.sinaimg.cn/large/74311666jw1f732uvb6o4j20cg06fwgj.jpg)
图例2.7</center>

在这个分支上修改得差不多的时候，如果想要把这个分支加回到主干(master)上，首先需要加载(stage)并且提交(commit)你的文件：
```python
git add .git commit -m "third commit"
```	
然后你移到主干分支：
```python
git checkout master
```	

最后像这样合并：
```python
git merge new_feature
```	
<center>![图例2.8](http://ww3.sinaimg.cn/large/74311666jw1f732uvb6o4j20cg06fwgj.jpg)
图例2.8</center>

此时，主干分支就和新功能分支会变成一样的了。
 
###**丢弃分支**

相反，如果你打算丢弃你在分支里做的修改，你首先需要加载你的文件并且在分支里提交：
```python
git add .git commit -m "feature to be discarded"
```	
然后，你移到主干分支：
```python
git checkout master
```	
<center>![图例2.9](http://i4.buimg.com/567571/44f97ee4131ae283.png)
图例2.9</center>

现在，你的代码处于你创建分支之前的状态了。
 
###**删除分支**

如果你要把你的分支合并到主干分支，从主干（master）分支上发送：
```python
git branch -d new_feature
```	
<center>![图例2.10](http://i4.buimg.com/567571/c5d13b847ae0bd22.png)
图例2.10</center>

发现"new_feature"这个分支确实被删除了。
假如修改已经合并了，它只会删除分支。假如分支没有合并，你会得到一个错误信息。删除一个未合并的分支（通常你不想保留的修改），你需要发送一样的命令附带一个大写D。意思是“强制删除分支，无论如何我不想要它了”。
```python
git branch -D new_feature
```	
###**回滚到之前的提交状态**

在某些时候，你可能想要回到之前的代码版本。首先，你需要找到你想回到哪个版本。要看所有的完成了的提交，发送：
```python
git log
```	
<center>![图例2.11](http://i2.buimg.com/567571/61f7c94d879a7f89.png)
图例2.11</center>


这会输出你的提交的历史记录。

如果你想回到“second commit”这个提交，简单地用提交的ID做签出(checkout)（可以只用到ID开头的9个字符）
```python
git checkout cc87a2d42
```	
<center>![图例2.12](http://i2.buimg.com/567571/d94a33cde2ab47dc.png)
图例2.12</center>

你也可以签出到一个新的分支，像这样：
```python
git checkout -b my_previous_version cc87a2d42
```	
但是，要注意保持分支的清晰，太多的分支会导致整个仓库的混乱，让整个项目失去控制。

###**推送请求**
假设有就如同以往按照流程，初始clone代码库到本地主机上，B就可以尽情修改code(branch、commit、merge、push)，每次 B push 更新，都只會更新自己的代码库b，并不会影响到到A的代码库a。
如果哪天B觉得自己新增加的内容很不錯，可以帮助到A(群主)，想跟A分享，那就可以发一个**pull request**，问问A要不要这一份。
下面我用两个帐号模拟fork和pull request：
我用帐号B fork了A的一个代码库a，成为了自己的b，修改提交之后，然后想把改动增加到A的库a里，于是点击“Create pull request”：
<center>![图例2.13](http://i1.buimg.com/567571/602794dc1adce90b.png)
图例2.13</center>

A帐号马上收到了邮件通知，当然github主页也有消息通知。
<center>![图例2.14](http://i1.buimg.com/567571/950f871ec606979b.png)
图例2.14</center>

A收到这则pull request之后，如果覺得ok，用线上merge，就會將代码库b合并到代码库a上。
<center>![图例2.15](http://i4.buimg.com/567571/78f4a14665338bef.png)
图例2.15</center>
 
###**推送到远程代码库**

在第一次你想推送一个本地代码库到远程代码库时，你需要把它添加到你的项目配置里。像这样做：
```python
git remote add origin https://your_username@bitbucket.org/your_username/name_of_remote_repository.git
```
<center>![图例2.16](http://i2.buimg.com/567571/7278dadf2225764f.png)
图例2.16</center>

注意这里的“origin”只是一个习惯。它是你的远程代码库的别名，但是你可以用其他任何你喜欢的词。你甚至可以有多个远程代码库，你只需要给它们起不同的别名。
之后，推送你的本地代码库的主干分支到你的远程代码库：
```python
git push origin master
```
下图是在另一台电脑上对该库文件修改后提交并推送的示例：
<center>![图例2.17](http://i2.buimg.com/567571/ae42b03c927abfa2.png)
图例2.17</center>

###**取得远程代码库的一份本地拷贝**

如果你还没有一份远程代码库的本地版本（例如，如果你在另一台机器上开始工作，这台机器上还没有用过这个项目），你首先需要拷贝（clone）它。我用了一台新的电脑，新建了连接，然后获取了github代码库里的内容。去到代码库想要拷贝到的文件夹下，并发送：
```python
git clone https://your_username@bitbucket.org/your_username/name_of_remote_repository.git
```
<center>![图例2.18](http://i4.buimg.com/567571/fa8cf22dd8193d3c.png)
图例2.18</center>

果然在这台电脑本地库目录下多了一个“learngit”文件夹：
<center>![图例2.19](http://i2.buimg.com/567571/bf4f9479a6c37046.png)
图例2.19</center>

这样就可以在不同的电脑上、由不同的人一起完成一个代码库。
另一方面，如果已经在本地的项目上工作了，只是想从远程代码库上取得它最新的版本，那我用回之前的电脑，移动到项目的根目录下(注意，不在根目录下无法获取)，并发送：
```python
git pull first master
```
<center>![图例2.20](http://i4.buimg.com/567571/7e7fa1c6d7cbed84.png)
图例2.20</center>


###**更多**

+ 如果对命令行的git使用方式很不适应，还可以下载git的**GUI版本**，比如GitHub Desktop和Gitbox(见网站https://git-scm.com/downloads/guis)，GUI版本的git确实要比命令行更直观更容易入门。
+ 当然，还有比这些更多的**Git**的相关知识，本文也是我参考网上的资料进行整理、修改和实践得到的。如果有疑惑或者需要更进一步了解的地方，可以自己搜索“**Git**”相关资料或者和我联系，相信你会有更多收获。
