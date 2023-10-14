.DEFAULT_GOAL := help

help:
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

init: ## Initialising the project
	@echo "Initialising the project"
	@npm ci
	@echo "✅"

build: test ## Build the project
	@npm run build
	@echo "✅"

test: ## Run the tests
	@npm run test
	@echo "✅"

release_patch: release ## Create a new patch release

release_minor: ## Create a new minor release
	@.scripts/finish-release minor

release_major: ## Create a new major release
	@.scripts/finish-release major

release: ## Create a new patch release
	@.scripts/finish-release patch
