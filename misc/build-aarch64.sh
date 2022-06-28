#!/bin/sh

DENO_OS=$(deno eval "console.log(Deno.build.os)")
FLAGS=

case $os in
darwin)
  FLAGS=-F/host/Frameworks
  ;;
esac

ARCH=aarch64 CC="zig cc -target aarch64-${DENO_OS} ${FLAGS}" make clean dist
