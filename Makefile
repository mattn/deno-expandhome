SRCS = \
	expandhome.c

OBJS = $(subst .c,.o,$(SRCS))

CFLAGS = -shared
LDFLAGS = -shared
LIBS = 
TARGET = libexpandhome

DENO_OS := $(shell deno eval "console.log(Deno.build.os)")
ARCH := $(shell deno eval "console.log(Deno.build.arch)")

ifeq ($(DENO_OS),windows)
  TARGET := $(TARGET)-$(ARCH).dll
  LIBS = -ladvapi32 -lnetapi32
endif
ifeq ($(DENO_OS),linux)
  TARGET := $(TARGET)-$(ARCH).so
endif
ifeq ($(DENO_OS),darwin)
  TARGET := $(TARGET)-$(ARCH).dylib
endif

export PLUGIN_URL := ./

.SUFFIXES: .c .o

all: $(TARGET)

$(TARGET): $(OBJS)
	gcc -o $@ $(LDFLAGS) $(OBJS) $(LIBS)

.c.o:
	gcc -c $(CFLAGS) -I. $< -o $@

dist: $(TARGET)
	mkdir -p dist
	cp $(TARGET) dist/

clean:
	rm -f *.o $(TARGET)

test: $(TARGET)
	deno run --unstable --allow-write --allow-env --allow-read --allow-ffi ffi.ts
