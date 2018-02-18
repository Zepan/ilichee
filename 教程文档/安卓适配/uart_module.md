# UART适配

## linux 下适配

使用默认编译的安卓系统，ls /dev可以看到 ttyS0~3

尝试`echo 'test' > /dev/ttyS0`可以在串口终端看到test字符，说明uart1就是ttyS0

荔枝派上除了默认的uart1是系统log输出口外，uart0与sdc0复用，不方便使用，就剩uart3可以使用。

linux下使用stty设置串口参数：

    stty -F /dev/ttyS1 ispeed 115200 ospeed 115200

但是发现对ttyS0之外的串口操作会返回：`stty: /dev/ttyS1: Input/output error`

在linux的驱动目录下找到相关文件：`tty/serial/8250_sunxi.c`

```c
struct platform_device sw_uart_dev[] = {
    [0] = {.name = "sunxi-uart", .id = 0, .num_resources = ARRAY_SIZE(sw_uart_res[0]), .resource = &sw_uart_res[0][0], .dev = {}},
......
};

static int __init sw_serial_init(void)
{
    int ret;
    int i;
    int used = 0;
    char uart_para[16];

    memset(sw_serial, 0, sizeof(sw_serial));
    uart_used = 0;
    for (i=0; i<MAX_PORTS; i++, used=0) {
        sprintf(uart_para, "uart_para%d", i);
        ret = script_parser_fetch(uart_para, "uart_used", &used, sizeof(int));
        if (ret)
            UART_MSG("failed to get uart%d's used information\n", i);
        if (used) {
            uart_used |= 1 << i;
            platform_device_register(&sw_uart_dev[i]);		//这里注册平台设备，往下看probe实现
        }
    }

    if (uart_used) {
        UART_MSG("used uart info.: 0x%02x\n", uart_used);
        ret = platform_driver_register(&sw_serial_driver);
        return ret;
    }

        return 0;
}

static int __devinit
sw_serial_probe(struct platform_device *dev)
{
    struct sw_serial_port *sport;
        int ret;
    UART_MSG("this coming sw_serial_probe\n");
        sport = kzalloc(sizeof(struct sw_serial_port), GFP_KERNEL);
        if (!sport)
                return -ENOMEM;
    sport->port_no  = dev->id;
    sport->pdev     = dev;

    ret = sw_serial_get_config(sport, dev->id);
    if (ret) {
        UART_MSG(KERN_ERR "Failed to get config information\n");
        goto free_dev;
    }

    ret = sw_serial_get_resource(sport);
    if (ret) {
        UART_MSG(KERN_ERR "Failed to get resource\n");
        goto free_dev;
    }
    platform_set_drvdata(dev, sport);

    sport->port.irq     = sport->irq;
    sport->port.fifosize= 64;
        sport->port.regshift= 2;
    sport->port.iotype  = UPIO_DWAPB32;
    sport->port.flags   = UPF_IOREMAP | UPF_BOOT_AUTOCONF;
    sport->port.uartclk = sport->sclk;
    sport->port.pm      = sw_serial_pm;
    sport->port.dev     = &dev->dev;

    sport->port.mapbase = sport->mmres->start;
    sw_serial[sport->port_no] = serial8250_register_port(&sport->port);		//注册端口
    UART_MSG("serial probe %d, membase %p irq %d mapbase 0x%08x\n",
             dev->id, sport->port.membase, sport->port.irq, sport->port.mapbase);
        UART_MSG("sport->pdev is %x \n &sport->pdev is %x",sport->pdev,&sport->pdev);
        UART_MSG("pdev.dev is %x \n &pdev.dev is %x",sport->pdev->dev,&sport->pdev->dev);
        UART_MSG("dev.dev is %x \n &dev.dev is %x",dev->dev,&dev->dev);
        return 0;
free_dev:    
    kfree(sport);
    sport = NULL;
    return ret;
}
```

.config

```shell
CONFIG_SERIAL_8250=y
CONFIG_SERIAL_8250_CONSOLE=y
CONFIG_SERIAL_8250_SUNXI=y
CONFIG_SERIAL_8250_NR_UARTS=4
CONFIG_SERIAL_8250_RUNTIME_UARTS=4
```

8250.c

```c
#define UART_NR	CONFIG_SERIAL_8250_NR_UA RTS
static unsigned int nr_uarts = CONFIG_SERIAL_8250_RUNTIME_UARTS;

int serial8250_register_port(struct uart_port *port)
{
        struct uart_8250_port *uart;
        int ret = -ENOSPC;

        if (port->uartclk == 0)
                return -EINVAL;

        mutex_lock(&serial_mutex);

        uart = serial8250_find_match_or_unused(port);
        if (uart) {
                uart_remove_one_port(&serial8250_reg, &uart->port);
                uart->port.iobase       = port->iobase;
                uart->port.membase      = port->membase;
                uart->port.irq          = port->irq;
                uart->port.irqflags     = port->irqflags;
                uart->port.uartclk      = port->uartclk;
                uart->port.fifosize     = port->fifosize;
                uart->port.regshift     = port->regshift;
                uart->port.iotype       = port->iotype;
                uart->port.flags        = port->flags | UPF_BOOT_AUTOCONF;
                uart->port.mapbase      = port->mapbase;
                uart->port.private_data = port->private_data;
                if (port->dev)
                        uart->port.dev = port->dev;

                if (port->flags & UPF_FIXED_TYPE)
                        serial8250_init_fixed_type_port(uart, port->type);

                set_io_from_upio(&uart->port);
                /* Possibly override default I/O functions.  */
                uart->port.flags        = port->flags | UPF_BOOT_AUTOCONF;
                uart->port.mapbase      = port->mapbase;
                uart->port.private_data = port->private_data;
                if (port->dev)
                        uart->port.dev = port->dev;

                if (port->flags & UPF_FIXED_TYPE)
                        serial8250_init_fixed_type_port(uart, port->type);

                set_io_from_upio(&uart->port);
                /* Possibly override default I/O functions.  */
                if (port->serial_in)
                        uart->port.serial_in = port->serial_in;
                if (port->serial_out)
                        uart->port.serial_out = port->serial_out;
                /*  Possibly override set_termios call */
                if (port->set_termios)
                        uart->port.set_termios = port->set_termios;
                if (port->pm)
                        uart->port.pm = port->pm;

                if (serial8250_isa_config != NULL)
                        serial8250_isa_config(0, &uart->port,
                                        &uart->capabilities);

                ret = uart_add_one_port(&serial8250_reg, &uart->port);
                if (ret == 0)
                        ret = uart->port.line;
        }
        mutex_unlock(&serial_mutex);

        return ret;
}
```

serial_core.c

```c
/**
 *      uart_add_one_port - attach a driver-defined port structure
 *      @drv: pointer to the uart low level driver structure for this port
 *      @uport: uart port structure to use for this port.
 *
 *      This allows the driver to register its own uart_port structure
 *      with the core driver.  The main purpose is to allow the low
 *      level uart drivers to expand uart_port, rather than having yet
 *      more levels of structures.
 */
int uart_add_one_port(struct uart_driver *drv, struct uart_port *uport)
{
        struct uart_state *state;
        struct tty_port *port;
        int ret = 0;
        struct device *tty_dev;

        BUG_ON(in_interrupt());

        if (uport->line >= drv->nr)
                return -EINVAL;

        state = drv->state + uport->line;
        port = &state->port;

        mutex_lock(&port_mutex);
        mutex_lock(&port->mutex);
        if (state->uart_port) {
                ret = -EINVAL;
                goto out;
        }
                state->uart_port = uport;
        state->pm_state = -1;

        uport->cons = drv->cons;
        uport->state = state;

        /*
         * If this port is a console, then the spinlock is already
         * initialised.
         */
        if (!(uart_console(uport) && (uport->cons->flags & CON_ENABLED))) {
                spin_lock_init(&uport->lock);
                lockdep_set_class(&uport->lock, &port_lock_key);
        }

        uart_configure_port(drv, state, uport);

        /*
         * Register the port whether it's detected or not.  This allows
         * setserial to be used to alter this ports parameters.
         */
        tty_dev = tty_register_device(drv->tty_driver, uport->line, uport->dev);	//最终注册设备
        if (likely(!IS_ERR(tty_dev))) {
                device_init_wakeup(tty_dev, 1);
                device_set_wakeup_enable(tty_dev, 0);
        } else
                printk(KERN_ERR "Cannot register tty device on line %d\n",
                       uport->line);
                     /*
         * Ensure UPF_DEAD is not set.
         */
        uport->flags &= ~UPF_DEAD;

 out:
        mutex_unlock(&port->mutex);
        mutex_unlock(&port_mutex);

        return ret;
}

tty_io.c

```c
struct device *tty_register_device(struct tty_driver *driver, unsigned index,
                                   struct device *device)
{
        char name[64];
        dev_t dev = MKDEV(driver->major, driver->minor_start) + index;

        if (index >= driver->num) {
                printk(KERN_ERR "Attempt to register invalid tty line number "
                       " (%d).\n", index);
                return ERR_PTR(-EINVAL);
        }

        if (driver->type == TTY_DRIVER_TYPE_PTY)
                pty_line_name(driver, index, name);
        else
                tty_line_name(driver, index, name);

        return device_create(tty_class, device, dev, NULL, name);
}
EXPORT_SYMBOL(tty_register_device);

static void tty_line_name(struct tty_driver *driver, int index, char *p)
{
        sprintf(p, "%s%d", driver->name, index + driver->name_base);	//最终的ttySx
}
```

大致的驱动加载过程就是上面这样

下面看下log信息：
    [    0.158533] [uart]: used uart info.: 0x06
    [    0.158563] [uart]: this coming sw_serial_probe
    [    0.288179] [uart]: serial probe 1, membase   (null) irq 2 mapbase 0x01c28400
    [    0.295378] [uart]: sport->pdev is c08c4a08 
    [    0.295383]  &sport->pdev is df04c2c8[uart]: pdev.dev is c08c4ad0 
    [    0.303155]  &pdev.dev is c08c5680[uart]: dev.dev is c08c4ad0 
    [    0.309079]  &dev.dev is c08c5680[uart]: this coming sw_serial_probe
    [    0.318097] [uart]: <3>Failed to get config information
    [    0.323344] sunxi-uart: probe of sunxi-uart.2 failed with error -1

可见uart1和uart3在获取fex时都被识别出来了，uart1成功probe，但是uart3 *“Failed to get config information”*

uart3对应sw_uart_dev[2],即

```c
   ret = sw_serial_get_config(sport, dev->id);
    if (ret) {
        UART_MSG(KERN_ERR "Failed to get config information\n");
        goto free_dev;
    }

static int sw_serial_get_config(struct sw_serial_port *sport, u32 uart_id)
{
    char uart_para[16] = {0};
    int ret;

    sprintf(uart_para, "uart_para%d", uart_id);
    ret = script_parser_fetch(uart_para, "uart_port", &sport->port_no, sizeof(int));
    if (ret)
        return -1;
    if (sport->port_no != uart_id)
        return -1;
    ret = script_parser_fetch(uart_para, "uart_type", &sport->pin_num, sizeof(int));
    if (ret)
        return -1;

    return 0;
}
```

查看可知fex里的uart_port和uart_parax必须一一对应，所以就是fex里之前写错了，改正回来

这时查看ttyS1参数就有了：

```shell
busybox stty -F /dev/ttyS1
speed 9600 baud;
intr = ^C; quit = ^\; erase = ^?; kill = ^U; eof = ^D; eol = <undef>;
eol2 = <undef>; start = ^Q; stop = ^S; susp = ^Z; rprnt = ^R; werase = ^W;
lnext = ^V; flush = ^O; min = 1; time = 0;
-brkint -imaxbel
```

设置下波特率，并测试

```shell
busybox stty -F /dev/ttyS1 ispeed 115200 ospeed 115200
echo 'test' > /dev/ttyS1
```

成功在uart3上收到数据~
