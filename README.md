

# apt-history

Explore apt history from a history log

## Rationale

By default, Debian's `apt-get install somepackage` will also install suggested and recommended packages for `somepackage`. If you change your mind and do `apt-get remove somepackage`, it will remove somepackage but not touch the suggetsted and recommended package, which will be laying around forever. This is why, sometimes, you install a package that takes up 20 megabytes, and when you remove it, only 200K get freed. These situations are quit common.

Should you wish to "undo" an apt-get install operation and reclaim back all the used space, then one simple solution is to look at the apt history log, usually in `/var/log/apt/history.log` for all the packages which were installed by `apt-get install` and remove them one by one.

This node script makes it easier to inspect the apt log and to list packages for removal.

## Warnings

This is kind of rough. It does the job for me, though.

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

List 10 last commands. The latest command is at the bottom.

```
cat /var/log/apt/history.log |apt-history 
```

List 10 commands starting from the 40th operation in history.log

```
cat /var/log/apt/history.log |apt-history --from 40
```

You can also list packages which were removed across the last 10 operations, for example

```
cat /var/log/apt/history.log |apt-history Remove
```


Examine 4th command in the history log

```
cat /var/log/apt/history.log |apt-history 4
```

Get property "Purge" of the 4th command  
This would be the tist of packages purged by the command

```
cat /var/log/apt/history.log |apt-history 4 Purge
```

Get packages installed  by 4th command

```
cat /var/log/apt/history.log |apt-history 4 Install --as-apt-arguments
```

`--as-apt-argument` returns a space-separated list of package names

### Rolling back an apt-get install

This is the main use schenario of this script.  

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
is comparable to:

```
cat /var/log/apt/history.log |apt-history 
```

#### Alternative approach

Since the major use case for this script is to rollback a particular package installation, it might be better to look into the package info for the list of suggested and recommended packages instead of looking at the apt log.

This will also make it easier to deal with packages which were installed through downloaded .deb archives.

I have noticed that the output format of `apt-cache show` and of `cat /var/log/apt/history.log` are similar, so it should be possible to reuse the parsing code.

## Additional relevant material:

* https://askubuntu.com/questions/247549/is-it-possible-to-undo-an-apt-get-install-command
 * http://mavior.eu/apt-log/examples/
