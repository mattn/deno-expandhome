SRCS = \
	expandhome.c

OBJS = $(subst .c,.o,$(SRCS))

CFLAGS = -shared
LDFLAGS = -shared
LIBS = 
TARGET = libexpandhome
ifeq ($(OS),Windows_NT)
TARGET := $(TARGET).dll
LIBS = -ladvapi32 -lnetapi32
else
TARGET := $(TARGET).so
endif

.SUFFIXES: .c .o

all : $(TARGET)

$(TARGET) : $(OBJS)
	gcc -o $@ $(LDFLAGS) $(OBJS) $(LIBS)

.c.o :
	gcc -c $(CFLAGS) -I. $< -o $@

clean :
	rm -f *.o $(TARGET)

test: $(TARGET)
	deno run --unstable --allow-ffi ffi.ts
