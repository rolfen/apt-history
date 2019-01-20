When uninstalling a package, it would be nice to check whether this package is a dependency or suggests/recommends of a subsequently installed package, in which case it would be better kept.

Eg:
 1. Package A installs package R1 as a recommended package.
 2. Package B is installed and has R1 as recommended package as well.
 3. If we roll back the installation of package A, then package B will loose it's recommended package (R1).

