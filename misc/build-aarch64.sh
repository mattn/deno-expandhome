#!/bin/sh

DENO_OS=$(deno eval "console.log(Deno.build.os)")
FLAGS=

case $os in
linux)
  FLAGS=-target aarch64-linux
  ;;
darwin)
  FLAGS=-target aarch64-macos -F/host/Frameworks
  ;;
esac

ARCH=aarch64 CC="zig cc ${FLAGS}" make clean dist
