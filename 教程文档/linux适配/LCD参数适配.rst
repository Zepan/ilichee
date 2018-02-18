LCD的参数适配
=====================

LCD的参数和其他外设一样在fex文件里修改

像分辨率和画布偏移之类的，都在以下字段：

.. code-block:: c

    lcd_x = 800
    lcd_y = 480
    lcd_dclk_freq = 33
    lcd_hv_hspw = 23
    lcd_hbp = 46
    lcd_ht = 1055
    lcd_hv_vspw = 1
    lcd_vbp = 10
    lcd_vt = 1050

例如改成1024*768

.. code-block:: c

    lcd_x = 		1024
    lcd_y = 		768
    lcd_dclk_freq = 65
    lcd_hv_vspw = 	6
    lcd_hv_hspw = 	136
    lcd_hbp = 		180
    lcd_ht = 		1344
    lcd_vbp = 		29
    lcd_vt = 		1612

在超分辨率使用时，注意以下代码（具体查看源码）的限制

.. code-block:: c

    /* hv panel, CPU panel and ttl panel */
    if (info->lcd_if == 0 || info->lcd_if == 1 || info->lcd_if == 2) {
        /* MHz */
        if (lcd_dclk_freq > 2000000 && lcd_dclk_freq <= 297000000) {
            /* divider for dclk in tcon0 */
            *divider = 297000000 / (lcd_dclk_freq);
            pll_freq = lcd_dclk_freq * (*divider);
        } else {
            return -1;
        }
    } 

以下是未整理的移植时的手记，可以参考：

drivers/video/sunxi_display.c
    ``video_hw_init``

drivers/video/videomodes.c

.. code-block:: c

    int video_get_params (struct ctfb_res_modes *pPar, char *penv)
    mode: 0~9	640*480~1920*1200,默认0
    x:
    y:
    refresh:
    le:left_margin
    ri:right_margin
    up:upper_margin
    lo:lower_margin
    hs:hsync_len
    vs:vsync_len
    sync:sync
        #define FB_SYNC_HOR_HIGH_ACT	1	/* horizontal sync high active	*/
        #define FB_SYNC_VERT_HIGH_ACT	2	/* vertical sync high active	*/
        #define FB_SYNC_EXT		4	/* external sync		*/
        #define FB_SYNC_COMP_HIGH_ACT	8	/* composite sync high active	*/
        #define FB_SYNC_BROADCAST	16	/* broadcast video timings	*/
                            /* vtotal = 144d/288n/576i => PAL  */
                            /* vtotal = 121d/242n/484i => NTSC */
        #define FB_SYNC_ON_GREEN	32	/* sync on green */
    vmode:vmode
        #define FB_VMODE_NONINTERLACED	0	/* non interlaced */
        #define FB_VMODE_INTERLACED	1	/* interlaced	*/
        #define FB_VMODE_DOUBLE		2	/* double scan */
        #define FB_VMODE_ODD_FLD_FIRST	4	/* interlaced: top line first */
    pclk:pixclock
    pclk_khz:pixclock_khz
    depth: 色深
    
    bp = mode->hsync_len + mode->left_margin;
            10				(43-10)=33
    total = mode->xres + mode->right_margin + bp;
                480			8				43
                
    bp = mode->vsync_len + mode->upper_margin;
            10					(12-10)=2
    total = mode->yres + mode->lower_margin + bp;
            272				4				12
    x:480,y:272,depth:18,pclk_khz:9000,le:33,ri:8,up:2,lo:4,hs:10,vs:10,sync:0,vmode:0
    x:800,y:480,depth:18,pclk_khz:33000,le:100,ri:170,up:35,lo:2,hs:10,vs:10,sync:0,vmode:0

    Setting up a 480x272 lcd console (overscan 0x0) 背光闪了下
    drivers/video/sunxi_display.c
        video_hw_init
            sunxi_mode_set(mode, fb_dma_addr);
                static void sunxi_lcdc_backlight_enable(void)
    hsync + hbp(back porch) + X len + hfp(front porch)
    hb(H blanking)

hbp相当于画面在画布中的偏移，

屏幕在左边和上边都有一部分不能显示的等待区域，要调整hbp移出这部分，

否则会有一部分在屏幕外不显示

hsync值只要大于1即可