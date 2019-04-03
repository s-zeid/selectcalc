all: xpi cli.js
.PHONY: xpi watch-xpi

xpi:
	web-ext build -s "src" -o

watch-xpi:
	web-ext build -s "src" --as-needed -o

cli.js: src/decimal-parser.js src/calculator.js src/cli.js.in
	printf '#!/usr/bin/env node' > $@
	for i in $^; do \
	 printf '\n\n// %s\n' "$$i" >> $@; \
	 cat "$$i" >> $@; \
	done
	chmod +x $@

html: product-page.html
product-page.html: README.md
	pandoc -f markdown-smart -t html5 $< -o $@.tmp
	awk '\
	 BEGIN { hr_seen = 0 }; \
	 /<hr ?\/?>/ { hr_seen = 1; }; \
	 { \
	  if (hr_seen == 2) { print; } \
	  else if (hr_seen == 1) { hr_seen = 2; } \
	 }' $@.tmp > $@
	mv $@ $@.tmp
	sed -i -e 's,<em>\(Nineteen Eighty-Four\)</em>,<i>\1</i>,g' $@.tmp
	sed -i -e 's,<p>,\n,g; s,</p>,,g; s,&quot;,",g' $@.tmp
	sed -i -e 's,<h[1-6][^>]*>,\n<b>,g; s,</h[1-6]>,</b>,g' $@.tmp
	sed -i -e 's,^<\(b\|strong\)>,\n<\1>,g' $@.tmp
	tail -n +2 $@.tmp > $@
	rm -f $@.tmp
