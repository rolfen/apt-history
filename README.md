# apt-history
Explore apt history from a history log

```
# List 10 last commands
cat /var/log/apt/history.log |apt-history 

# List 10 commands starting from command 40
cat /var/log/apt/history.log |apt-history from 40

# Examine command 4th command
cat /var/log/apt/history.log |apt-history 4

# Get attribute Purge of 4th command
# That would be the tist of packages purged by the command
cat /var/log/apt/history.log |apt-history 4 Purge

# Get packages installed  by 4th command
# It would return them in a format that can be used for apt-get
cat /var/log/apt/history.log |apt-history 4 Install as-package-list


```

