# apt-history
Explore apt history from a history log

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

List 10 last commands

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
cat /var/log/apt/history.log |apt-history 4 Install as-apt-arguments
```

as-apt-argument formats the output to be used as apt-get argument

For example, this will uninstall all packages installed by the 4th command  
It's the main purpose of this script  

Beware: this might cause more recently installed packages to be automatically uninstalled.

```
apt-get remove `cat /var/log/apt/history.log| apt-history 4 Install as-apt-arguments`
```


Other interesting scripts:
* http://mavior.eu/apt-log/examples/
