REPOMIX_OUTPUT ?= repomix-output.xml

.PHONY: repomix
repomix:
	npx repomix@latest --output $(REPOMIX_OUTPUT)
