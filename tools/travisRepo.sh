if [ $(git rev-parse --abbrev-ref HEAD) = "master" ] && test $(grep shexSpec/shexTest.git .travis.yml | grep branch=master | wc -l) != 1
then echo "ERROR in .travis.yml: shex.js master should be testing on shexTest master\n^^^^^\n" ; exit -1
fi
