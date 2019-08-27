

# apt-history

Explore the apt history


## Installing (globally)

```
sudo npm -g i https://github.com/rolfen/apt-history.git
```

Or, alternatively:

```
git clone https://github.com/rolfen/apt-history.git
sudo npm -g i ./apt-history
```

To uninstall:

```
sudo npm -g r apt-history
```


## Using

By default, lists the last 10 commands (this number can be changed with `--limit`).
The commands are numerotated with the first command in the input being zero.
The latest command is at the bottom.

```
apt-history 
```

List 10 commands starting from the 40th operation in history.log

```
apt-history --from 40
```

You can also list packages which were removed, for example

```
apt-history Remove
```


Examine 4th command in the history log

```
apt-history 4
```

Get property "Purge" of the 4th command  
This would be the list of packages purged by the command

```
apt-history 4 Purge
```

Get packages installed  by 4th command. `--as-apt-argument` returns a space-separated list of package names.

```
apt-history 4 Install --as-apt-arguments
```

By default, `apt-history` looks for the APT log at `/var/log/apt/history.log`.

`-s` or `--stdin` allows you to pipe the APT log instead.

```
cat /var/log/apt/history.log |apt-history
```

You can also specify the location of the log file

```
apt-history --input /var/log/apt/history.log
```

### Rolling back an apt-get install


The following will attempt to **uninstall all packages installed by command #4** (including installed suggested and recommended packages) 

```
sudo dpkg -r `cat /var/log/apt/history.log| apt-history 4 Install --as-apt-arguments`
```

Here we use `dpkg -r` instead of `apt-get remove`. That is because `apt-get remove` will automatically remove any dependant package. For example is you do `apt-get remove evolution` it will automatically remove the whole Gnome desktop package because it depends on `evolution`.

`dpkg` will not do such a thing. Faced with this same problem, `dpkg` will just fail instead of automatically uninstalling dependant packages. In the case where it fails, you can add `--force-depends` to the `dpkg` command to tell it to ignore dependency problems.

Ignoring dependency problems with `--force-depends` can create broken packages (it will print a warning to tell you), in which case you should run `apt-get --fix-broken install` afterwards.

### Notes

#### Shell tricks

You can also extract useful information using piping and standards shell tools. For example:

```
cat /var/log/apt/history.log| grep Commandline|nl -v 0|tail 
```
is similar to:

```
apt-history 
```

#### Misc

I have noticed that the output format of `apt-cache show` and of `cat /var/log/apt/history.log` are similar, maybe we can reuse code to parsing code.

#### Relevant links

* https://askubuntu.com/questions/247549/is-it-possible-to-undo-an-apt-get-install-command
 * http://mavior.eu/apt-log/examples/
