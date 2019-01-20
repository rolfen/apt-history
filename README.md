

# apt-history
Explore apt history from a history log

## Warnings

Alpha level software, not extensively tested. 

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
cat /var/log/apt/history.log |apt-history from 40
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

For example, this will uninstall all packages installed by the 4th command (without automatically uninstalling dependants).  
It's the main purpose of this script.  

It is safer to use `dpkg` then `apt`. apt might conceivably automatically uninstall dependant packages.

```
sudo dpkg -r `cat /var/log/apt/history.log| apt-history 4 Install --as-apt-arguments`
```

It might be useful to add `--force-depends` to the `dpkg` command.


Other interesting scripts:
* http://mavior.eu/apt-log/examples/
