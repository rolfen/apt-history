Here we discuss a *potential* implementation for rolling back APT operations.

## Discussion

When uninstalling a package, it would be nice to check whether this package is a dependency or suggests/recommends of a subsequently installed package, in which case it would better be kept.

Example:
 1. Package A installs package R1 as a recommended package.
 2. Package B is installed and has R1 as recommended package as well.
 3. If we roll back the installation of package A, then package B will loose it's recommended package (R1).

This means that the "rollback" implementation is flawed.

We can have the same problem with dependencies, in which case the consequences are more serious - it will break packages.


There are 3 approaches I can think of:
 1. Backtracking: First we roll back package B, then we roll back package A, then we re-install package B.
 2. Check each package that we are uninstalling during a roll-back. If it is a dependency or a suggestion/recommendation of another installed package then skip it.
 3. The current fix is to ignore dependencies (`dpkg -r --force-depends`) then to fix what we just broke (`apt-get --fix-broken install`). The problem remains for suggested/recommended packages.

