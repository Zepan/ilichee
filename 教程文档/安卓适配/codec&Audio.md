# codec适配及Audio系统解析

## codec适配

启动后耳机及mic无反应，开始绕了个大圈看了遍安卓的Audio系统，结果从最上层查到最底层，发现原因不过是fex没写全而已：

    [audio_para]
    audio_used = 1
    audio_playback_used = 1
    capture_used = 1
    audio_lr_change          = 0
    audio_pa_ctrl            = port:PG0<1><default><default><0>

加上audio_pa_ctrl的配置即可，这里使用了空闲引脚PG0，实际上没有接PA，也可以直接改驱动源码来支持不接PA，不过比较麻烦，就直接拿个空闲引脚凑数了。

## Audio系统解析

暂待更新
