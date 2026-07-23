# 01. Getting Started

## Ricing Debian? Why?
Usually, you'll find people ricing Arch or sometimes Fedora (honestly, I don't know if anyone still rices Fedora anymore). Customization posts around Debian are almost always restricted to choosing between GNOME, XFCE, KDE, or Cinnamon (probably missed a few).

I personally like none of those, and I don't fancy pre-packaged DEs. That is why, in this series, I'm going to rice Debian the same way people rice Arch.
Why Debian? Two reasons:
1. I've never managed to get Arch to work on my machine (*skill issue*)
2. I like the stability of Debian and good ol' `apt`. `pacman` is cool and all, but I much prefer simple `apt`.

## Rules
To achieve a clean rice, since this is my first real attempt, I'm setting a few ground rules for the project:
- Always start with a barebones Debian install
- Keep it lightweight, low disk and RAM usage
- No bloat, excessive, unused, or unnecessary packages are not allowed
- Practical and tailored, custom for my workflow and my hardware (you'll see why in the next post)
- Maintainable, easy to tweak, theme, and edit

Now, this system is going to be my daily driver. Up until now, I've been **"temporarily"** (read: *"indefinitely"*) using Kali (who even uses Kali???). Me. I was using Kali for some god-forsaken reason. I'd been planning to replace it for a long time, but I just never had the time to do it, even now I must carefully plan around my schedule to work on this. But it is about time I get to work on this.

## Let's Get Started (Really This Time)
Since I rely on my laptop daily, I can't risk going in blindly on the baremetal. I'll be using a virtual machine to test out everything first. The downside is that I won't get real hardware feedback regarding baremetal elements (again, more on that soon). If you want to follow, be my guest.

To start off, I'll be using Debian 13 (Trixie), which is the current Stable at the time of writing. One big perk it has is that the ISO includes non-free firmware out of the box, which if my memory doesn't betray me, became a thing since Debian 12 (Bookworm).

### Barebones Install
Starting the installation, I'm using the Debian 13.6.0 NetInstall ISO on VirtualBox.
Make sure to **deselect** the "Proceed with Unattended Installation" option if you are also experimenting with a VM. Otherwise, VirtualBox will run an automated installation and default to GNOME, defeating our barebones goal. I usually stick with the default VirtualBox settings for everything else, as they work fine for a test environment.

Now the installation of Debian is straightforward, but there are three things that need to be done:
- Assuming installation on hardware, during network configuration, if the network just works, good; but if not, then try to use Wi-Fi to get by, however I still prefer using Ethernet during this step since it usually never has issues, unlike Wi-Fi.
- During disk partitioning, separate the /home directory from the root, and make sure to set the swap size to your liking. The "Guided partitioning" option for this works just fine for our current VM. 
- During software selection, deselect everything but "standard system utilities"; this ensures only the necessary is installed.

With that, the installation should be done, though I personally like to take a snapshot of the machine at this point to not have to reinstall Debian in another VM just to test from scratch, mostly a time saving tip.

### Tell SuperUser what to DO
Right now, the VM has nothing on it, not even `sudo`.
To add it, switch to root:
```bash
su
```
Update and install `sudo`:
```bash
apt update
apt install sudo
```
Then add the user to the sudo group and switch back to the user session:
```bash
/usr/sbin/usermod -aG sudo USERNAME
su - USERNAME
```
Now you can tell the super user what to do.

## Wrapping Up
This is it for the basic setup to get started. With this out of the way, I will proceed in the next posts to address other essential setup steps, before then getting to the fun stuff of ricing Linux. 

---
> Written on: 2026-07-23

