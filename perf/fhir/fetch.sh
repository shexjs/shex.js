#!/bin/sh
# Fetch the FHIR schema and examples that perf/fhir/bench.js runs against.
#
# Neither is committed: they are large, they change with every FHIR build,
# and the point of running against them is to run against what FHIR
# publishes *now*.  Everything this writes is under perf/fhir/corpus/,
# which .gitignore covers.
#
# Usage: perf/fhir/fetch.sh [--force]
set -e
DIR="$(cd "$(dirname "$0")" && pwd)/corpus"
BASE=${FHIR_BASE:-http://build.fhir.org}
mkdir -p "$DIR"

fetch () { # url, file
  if [ -s "$DIR/$2" ] && [ "$1" != "--force" ]; then
    echo "have $2 ($(wc -c < "$DIR/$2" | tr -d ' ') bytes); --force to refetch"
  else
    echo "fetching $BASE/$2"
    curl -f -s -S -m 900 -o "$DIR/$2" "$BASE/$2"
  fi
}

fetch "$1" fhir.shex
fetch "$1" examples-ttl.zip

if [ ! -d "$DIR/examples" ] || [ "$1" = "--force" ]; then
  rm -rf "$DIR/examples"
  unzip -q -o "$DIR/examples-ttl.zip" -d "$DIR/examples"
fi
echo "corpus ready: $(ls "$DIR/examples" | wc -l | tr -d ' ') examples, schema $(wc -c < "$DIR/fhir.shex" | tr -d ' ') bytes"
echo "run: node perf/fhir/bench.js --help"
