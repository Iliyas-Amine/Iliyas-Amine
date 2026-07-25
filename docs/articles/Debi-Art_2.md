# 03. The Final Core Touch

## Recap
In the previous post, we went over manual firmware setup, some tweaks to GRUB, and cleaning up packages. I also mentioned that it was the bulk of the boring setup. So, in this post, we will finish up the setup and finally be able to move onto other tasks more in line with what you'd think ricing is all about.

## Core Dependencies
I never like to simply dump a command here without explaining what it does, but this will have to be the exception, and for good reason.<br>
What the following command does is install all the dependencies needed for the rest of the series. I will come back and edit it to add a new dependency if the need arises. It is simply a measure to simplify the bulky procedure of keeping an eye on all the packages I install.

With that said:
```bash
sudo apt install xorg build-essential libx11-dev libxinerama-dev libxft-dev git feh picom unzip libgtk-3-0 libnss3 libnspr4 libgbm1 libasound2 libpulse0 libcups2 libxss1 libdbus-1-3 libatk-bridge2.0-0 libxcomposite1 libxdamage1 libxrender1 libxrandr2 libxtst6 curl gpg iwd brightnessctl scrot libpam0g-dev libxcb-xkb-dev pipewire wireplumber pipewire-pulse pipewire-alsa libspa-0.2-bluetooth
```

Quite a big command, but I will say this, each time I reach a point that uses a dependency, I'll make sure to make that loud and clear.

## Sound & Audio
Time to setup sound!<br>
Technically speaking, this step could have been postponed and delayed until audio is needed, but I prefer to set it up now.<br>
Who doesn't love building out a new feature and having sound 'just work' because the foundation was already laid? I know I do.

To keep it simple, I'm using `pipewire` as the core audio engine, `wireplumber` as the session manager for it, `pipewire-pulse` and `pipewire-alsa` to handle applications and services expecting PulseAudio and ALSA respectively, and `libspa-0.2-bluetooth` for Bluetooth audio codecs.

All that’s left to do is enable the services:
```bash
systemctl --user enable pipewire pipewire-pulse wireplumber
```

It should work on the next reboot.

## Network Setup Finally!
Ethernet is automatically handled by the Debian install by default, since you need a way to be able to connect to the network. Wi-Fi on the other hand has a trickier situation, as drivers and managers differ.<br>
To compile the following instructions, I ran a standard Debian live USB to figure out how to get Wi-Fi going. I am using `iwd` for this, here is what I got:

Open/Create the `iwd` main config file:
```bash
sudo nano /etc/iwd/main.conf
```

Write the following lines:
```ini
[General]
EnableNetworkConfiguration=true
```

What this does is tell `iwd` to handle DHCP automatically, so no need for even `dhcpcd` or `systemd-networkd`.

Now we enable and start `iwd`:
```bash
sudo systemctl enable --now iwd
```

> **IMPORTANT**, `iwlwifi` (or other) should be active, otherwise `iwd` won't function.

Things get weird from here, but I'll try to keep it standard and simple. I'll go by the assumption that the interface is called `wlan0`. For me, before `iwd` was running, it was called `wlo1` and then it changed.

But to verify the interface name:
```bash
ip link
```

Or:
```bash
iwctl device list
```

Up next:
```bash
iwctl adapter phy0 set-property Powered on 
```

Whatever I tried, it didn't work for me until I powered on `phy0`. I'm assuming it represents the actual physical device, as in the physical wifi card.

Then it was simple from there:
```bash
iwctl station wlan0 scan
iwctl station wlan0 get-networks
```

Now, select a Wi-Fi network and to connect:
```bash
iwctl --passphrase "PASSWORD" station wlan0 connect "SSID"
```

Or if the Wi-Fi network doesn't have a password:
```bash
iwctl station wlan0 connect "SSID"
```

To check if the interface connected:
```bash
iwctl station wlan0 show
```

In a minimal setup without a separate network manager or systemd-resolved, Linux won't automatically know how to resolve domain names into IP addresses.

To fix this, append a free public DNS server to the system resolver file:
```bash
sudo nano /etc/resolv.conf
```

In there, write the IP address of the free, public Cloudflare DNS resolver:
```
nameserver 1.1.1.1
```

Or the IP address of some other DNS resolver.

It should be set now.

## Wrapping Up
With this, the core setup of the Debian machine is wrapped up. In upcoming posts, we can **finally** deal with new things.

---
> Written on: 2026-07-25
