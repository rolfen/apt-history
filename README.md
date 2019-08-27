# apt-history

Explore the APT history

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

```
apt-history 
```

By default, it reads last 10 "entries"/"operations" (this number can be changed with `--limit`) and list commands.
The entries are numbered following their sequence in the APT log, zero based.
The latest one is at the bottom.

To read 5 entries starting from #40 one in history.log

```
apt-history --from 40 --limit 5
```

You can also list packages removed packages, for example

```
apt-history Remove
```


Examine operation #4 in the history log

```
apt-history 4
```

Get property "Purge" of the operation  
This would be the list of packages purged by the command

```
apt-history 4 Purge
```

Get packages installed during this operation. `--as-apt-argument` returns a space-separated list of package names.

```
apt-history 4 Install --as-apt-arguments
```

By default, `apt-history` looks for the APT log at `/var/log/apt/history.log`.

`-s` or `--stdin` allows you to pipe the APT log instead.

```
cat /var/log/apt/history.log |apt-history -s
```

You can also specify the location of the log file

```
apt-history --input /var/log/apt/history.log
```

### Rolling back an apt-get install


The following will attempt to **uninstall all packages installed by command #4** (including installed suggested and recommended packages) 

```
sudo dpkg -r `apt-history 4 Install --as-apt-arguments`
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
