help:

	@echo "Possible targets:"
	@echo "  test - build all test suites"
	@exit 0

test:

	@echo "Execute all Tests"
	@bash tests/*.sh

.PHONY: test help

# vim: ts=4:sw=4:noexpandtab!:
