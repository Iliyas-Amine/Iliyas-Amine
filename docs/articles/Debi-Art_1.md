# 02. Firmware, GRUB, and Packages

## Recap
Last time, we left off at setting up sudo on a fresh barebones install. Here, we will continue with the *essential* and *boring* stuff. However, we have to get this out of the way before we can get to anything that's remotely fun.

## Firmware... or is it?
See, when I said last time that Debian 13 came with firmware, I wasn't lying. Normally, during the installation, your device is automatically scanned and the appropriate firmware is installed, which is great!
That said, the last time I tried installing Debian 13 on my actual hardware, I had not one, but two failed attempts, both related to firmware issues. So tell me, why is that? WHY? (If you remember, I did foreshadow this in the last post when I said the OS needs to fit with my hardware. You got it, right? You didn't need me to point it out, right? Right?)
I do not know. What I do know is that on my first attempt, the Wi-Fi card was not even detected; it wasn't working. On my second attempt, it was working until it wasn't, and to this day, I still do not know why that happened, though I suspect it was a firmware issue too.
So after this, I committed to **manually** downloading the firmware of my Wi-Fi card just in case. That way, at least I can blame myself for doing a shitty job.

Let's do it manually! First ensure non-free and non-free-firmware repos are enabled:
```bash
sudo nano /etc/apt/sources.list
```

First thing to notice is that all the lines starting with `deb` already have `non-free-firmware`, which is what we need, but let's just add two more things to avoid all future headaches, that being `contrib` and `non-free`. Respectively, they cover packages that are free and open-source but use non-free software, and packages that are proprietary and closed-source like some drivers.
So the `deb` lines should look something like this:
```
deb http://deb.debian.org/debian/ trixie main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian/ trixie-updates main contrib non-free non-free-firmware
```

Then:
```bash
sudo apt update
sudo apt install firmware-iwlwifi
```

It's important to note that I am using `firmware-iwlwifi` because I have an Intel Wi-Fi card, and this firmware package only covers those. Other Wi-Fi card manufacturers come with other firmware packages, usually under the form `firmware-<something>`.

Then finally, reload the drivers:
```bash
sudo modprobe -r iwlwifi && sudo modprobe iwlwifi
```

Done with firmware, hopefully.

## GRUB time! Not really
I'm tweaking GRUB, but not just for the sake of it; there are two specific things I want to accomplish.
First, I want to skip the boot menu entirely. I don't need to dual-boot, and if the OS ever fails to boot, I prefer using a Live USB to fix issues rather than GRUB’s Recovery Mode.
Second, I want to enable `zswap`, what is `zswap` you might ask? It's a great kernel feature that intercepts swap requests and compresses them into a dedicated RAM pool instead of writing directly to disk. If that RAM pool fills up, it simply decompresses the oldest page and flushes it to disk. It's nice because it’s fast, reduces latency, and saves precious disk I/O.

To apply the above, simply give a visit to `/etc/default/grub`:
```bash
sudo nano /etc/default/grub
```

Skip the boot menu:
```
GRUB_TIMEOUT=0
GRUB_TIMEOUT_STYLE=hidden
```

And enable `zswap`:
```
GRUB_CMDLINE_LINUX_DEFAULT="quiet zswap.enabled=1"
```

To finally apply the edits:
```bash
sudo update-grub
```

They'll take effect after the next reboot.

## Packages
Last section for this post, and it's really simple, purge the useless.
Didn't I go for a barebones install? Yes.
Does it mean **all** the packages on the VM are useful? No.
Some useless packages downloaded still; yes, it's quite absurd. I didn't ask for it and I was still given it. Why? I don't know. (Just noticed that me not knowing is a recurrent theme. Oh well, what do I know...)

So, I'll hunt 'em lil' unwanted packages and purge them. But how? I will not go into details but from what I have compiled, the following packages are useless and safe to purge.

**Important**, mark these packages:
```bash
sudo apt-mark manual bluetooth bluez iw wireless-tools wireless-regdb wpasupplicant powertop alsa-ucm-conf alsa-topology-conf
```

This tells `apt` that those packages are to keep. This is essential because when you try to purge `task-laptop`, apt suddenly thinks that all those are unnecessary just because they were automatically installed alongside it.

Now, purge these packages (yes, even `cron`, it's mostly legacy and `systemd` has its own timers now, move on):
```bash
sudo apt purge tasksel task-english task-laptop reportbug python3-reportbug installation-report doc-debian debian-faq inetutils-telnet ispell iamerican ibritish wamerican dictionaries-common anacron cron cron-daemon-common eject bzip2 bsdextrautils
sudo apt autoremove --purge
```

With that, we exorcised all the useless packages.

## Wrapping Up
This largely covers the boring setup part. The next post will cover the final bits we have yet to go over, such as audio, network management, and core dependencies, after which, we will get to the more exciting parts!

---
> Written on: 2026-07-23
