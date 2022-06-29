---
title: Managing shared dotfiles with chezmoi
date: 2022-06-25
description: A tool to manage dotfiles across devices
tags:
    - Developer
    - Configuration
---

I've always been aware of dotfile managers, but I've never really been invested enough to put the time into using one. That is until recently I've got a new work laptop, as well as a new personal laptop, meaning I've had a lot of setup to do and wanted to minimise the duplicated effort.
[Chezmoi](https://www.chezmoi.io/) is a dotfiles manager with a powerful templating engine, scripting capabilities, and all backed by a Github repo.
Their [docs](https://www.chezmoi.io/quick-start/) are superb, but there are a a few features I think are worth calling out as they really set chezmoi apart from other tools in the area.

# Templating

Chezmoi is written in Go, and takes advantage of this by having full [`text/template`](https://pkg.go.dev/text/template) support within all of your files.
What this means in practice is that you can write a dotfile once, providing a template for how that file might change across your different machines.
Below is an example of template which uses homebrew to install packages on macOS, and apt on Linux.
This means I only need to write this script in one place, rather than having one file per platform.

```bash
{{ if eq .chezmoi.os "darwin" -}}

#!/bin/bash
# install components on macOS

if ! command -v brew &> /dev/null
then
    echo "Installing Brew"
    ...
fi

brew install git

{{ else if eq .chezmoi.os "linux" -}}

#!/bin/bash
# install components on Linux
sudo apt install git

{{ end -}}
```

This is a fairly simple example but chezmoi has a huge set of [built in variables](https://www.chezmoi.io/reference/templates/variables/), as well as support for setting custom variables variables (an email address for example), meaning you can basically template anything you would like.
When your files are `chezmoi apply`'d then the rendered dotfiles will only contain the information matching the template definitions for your current machine.

# [.chezmoiignore](https://www.chezmoi.io/reference/special-files-and-directories/chezmoiignore/)

Sometimes it makes more sense to split machine independent logic into separate files.
In this case chezmoi provides a mechanism to ignore certain files so they're ignored in certain situations.
The `.chezmoiignore` also supports templating allowing for complex conditional ignores, for example I check the hostname of the current machine to figure out if it's my work machine or not, and I only deploy work specific dotfiles to my work machine.

# Scripts

If you're technical enough to be looking into dotfile managers you definitely are savvy enough to write your own scripts to manage your dotfiles and machine setup.
However chezmoi does provide a couple of benefits to running these scripts yourself.
You can prefix a script with [`run_once` or `run_onchange`](https://www.chezmoi.io/developer/architecture/#run_once_-and-run_onchange_-scripts) which tells chezmoi to track the SHA256 hash of the given script, and only run the script on your machine if it's never been run before, or if the hash has changed since the previous execution.
The differences between `run_once` and `run_onchange` are not very clear (in my opinion) in the docs, so to clarify:

-   For scripts prefixed with `run_once` chezmoi will store just the SHA256 of the file. This means if you have two identical files, the content will only run once, as chezmoi wont run a script if it has already ran a script with that hash. It also means that if you rename a script, it won't be re-run as chezmoi is only tracking the contents, not the name,
-   For scripts prefixed with `run_onchange` chezmoi stores both the filename and the SHA256 hash, meaning it's possible to have files with identical contents (although this probably isn't very valuable), and renaming a script will cause it to re-run.

Personally I prefer the idea behind `run_onchange` as I find it easier to conceptualise running a given file when that specific file changes, although it seems like `run_once` is less likely to run your scripts unnecessarily.

# Password manager integration

This isn't something I use personally, but chezmoi has templating functions which can perform calls to all the popular password managers.
This allows you to store confidential passwords (or even whole files) inside your password manager, and inject the contents into your dotfiles when they're generated.
This avoids the pitfall of storing secrets inside Git repos and potentially exposing these to the whole world if mismanged.
