# 05. Keep the Terminal Simple

## Recap
In the last post, I set up `dwm` with quite a lot of patches. It was relatively easy, but not the most fun thing to do. Today, I'll have to go through a bit more of that suffering. For in this post, I am setting up the [Suckless](https://suckless.org/) terminal, the simple terminal, `st`.

## Quite a lot of terminals
People usually go for other terminal emulators: `Terminator`, `Alacritty`, `Kitty`, etc.<br>
BUT. Here I am going for the Suckless alternative again, why? Do I like suffering? <small>(Maybe, a lot of my life decisions I made were not as well thought out as I'd wish.)</small> <br>
As much as patching can be a pain in the rear sometimes, I must say it can also be fun, and the result can be very fulfilling.

## Patching Time!
I will be patching `st` in a similar manner as I did for `dwm`, with the only change being that I won't cover the actual patching. I will hold myself to only exceptional cases.<br>
So the patches I'm applying are the following in the exact order and specific versions:
- [`scrollback`](https://st.suckless.org/patches/scrollback) - `st-scrollback-ringbuffer-0.9.2.diff`
- [`alpha`](https://st.suckless.org/patches/alpha) - `st-alpha-20220206-0.8.5.diff`
- [`boxdraw`](https://st.suckless.org/patches/boxdraw) - `st-boxdraw_v2-0.8.5.diff`
- [`ligatures`](https://st.suckless.org/patches/ligatures) - `st-ligatures-alpha-scrollback-ringbuffer-20241226-0.9.2.diff`
- Additionally for mouse support with `scrollback`: `st-scrollback-mouse-0.9.2.diff` & `st-scrollback-mouse-altscreen-20220127-2c5edf2.diff`
- [`sync`](https://st.suckless.org/patches/sync) - `st-appsync-20200618-b27a383.diff`
- [`xresources`](https://st.suckless.org/patches/xresources) - `st-xresources-20230320-45a15676.diff`
- [`font2`](https://st.suckless.org/patches/font2) - `st-font2-0.8.5.diff`
- [`netwmicon`](https://st.suckless.org/patches/netwmicon) - `st-netwmicon-0.8.5-v2.diff`
- [`clipboard`](https://st.suckless.org/patches/clipboard) - `st-clipboard-20180309-c5ba9c0.diff`

Consult the patch page for more info on each patch.

Now, the most interesting part of the patch is `ligatures` and the fact that it is applied after all three of `scrollback`, `alpha`, and `boxdraw`. The developers made patches that fit in with the first two, and that is the one being applied, but a conflict arose with a section of code that `boxdraw` patches.<br>
Fortunately, the developers also have a separate patch that fits with `boxdraw`. I opened that `.diff` file, pinpointed the section I needed, and with some simple copying and pasting magic, as well as wrapping my head around what was happening in that block, I fixed it.

## Wrapping Up
Well, this post was quite the short one, mainly because I did not bother going through the exact steps of patching `st`. Next post will be about yet another Suckless tool.

---
> Written on: 2026-08-02

