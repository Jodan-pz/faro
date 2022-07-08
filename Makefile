.DEFAULT_GOAL := help

ROOT:=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Args
DEVTOOLKIT_SCRIPT_SOURCE=https://raw.githubusercontent.com/vgmr/dev-toolkit/master/sync-toolkit/bin/dt-sync-toolkit
FARO_SERVER=localhost:5073
FARO_DATA_PATH?=/faro_data
FARO_DB_HOST?=faro-definition-db
SWAGGER_URI=http://$(FARO_SERVER)/swagger/v1/swagger.json
CACHE_SERVICE=cache-redis
CACHE_SERVICE_SHELL_STARTUP="redis-cli -h faro-$(CACHE_SERVICE)"
MAIL_CATCHER_SERVICE=mailcatcher

# Tools
DOCKER=docker
DOCKER_COMPOSE=docker-compose
DOTNET_CLI=dotnet
YARN_CLI=yarn
COMPOSE=$(DOCKER_COMPOSE) -p faro -f $(ROOT)docker-compose.yml
YARN_RUN=$(COMPOSE) run --rm yarn
DOTNET_WEBAPI_EXEC=$(DOCKER) exec -it -e FARO_DATA_PATH=$(FARO_DATA_PATH) faro-webapi
DOTNET_WEBAPI_RUN=$(DOCKER) run --rm -it -e FARO_DATA_PATH=$(FARO_DATA_PATH) -v $(ROOT):/workspace -v faro_data:$(FARO_DATA_PATH) -w /workspace --entrypoint ""  faro_webapi

# Colors
WHITE="\033[0;37m"
RED="\033[1;31m"
GREEN="\033[32m"
YELLOW="\033[1;33m"
LYELLOW="\033[33m"
BLUE="\033[1;34m"
LBLUE="\033[34m"
PINK="\033[35m"
CYAN="\033[1;36m"
NOCOLOR="\033[0m\033[K"

define logInfo
	@printf $(GREEN)"$(1)"$(NOCOLOR)"\n"
endef

define logNotice
	@printf $(LBLUE)"$(1)"$(NOCOLOR)"\n"
endef

define logSun
	@printf $(LYELLOW)"$(1)"$(NOCOLOR)"\n"
endef

define logFun
	@printf $(PINK)"$(1)"$(NOCOLOR)"\n"
endef


help: ## Display this help message
	@echo
	@printf $(GREEN)=$(BLUE)-------------------------------------------------$(NOCOLOR)$(GREEN)"=\n"
	@printf $(WHITE)"=                     F A R O                     =\n"
	@printf $(GREEN)=$(BLUE)-------------------------------------------------$(NOCOLOR)$(GREEN)"=\n"
	@echo
	@printf $(LYELLOW)"Please use \`make <target>\` where <target> is one of\n\n"$(NOCOLOR)
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf $(GREEN)"%-25s"$(NOCOLOR)"%s\n", $$1, $$2}' | sed -e "s/\[32m##/[36m/"

.PHONY: help

##
## Development
##

docker-compose.yml: docker-compose.yml.def
	@if [ ! -f "./docker-compose.yml" ]; then \
		cp docker-compose.yml.def docker-compose.yml; \
	fi;


init: ## Initialize tools
	$(call logInfo,Installing dev-toolkit (create-api-client)...)
	@curl -o- $(DEVTOOLKIT_SCRIPT_SOURCE) | TOOL=create-api-client bash 2> /dev/null

build: docker-compose.yml ## Update & build images
	$(call logInfo,Updating images...)
	@$(COMPOSE) pull --ignore-pull-failures || true 2> /dev/null
	$(call logNotice,Building images...)
	@$(COMPOSE) build --quiet --progress plain

dev: |init build client-deps start ## Initialize development

start: docker-compose.yml ## Start
	$(call logSun,Starting app...)
	@$(COMPOSE) up --build -d db db-image-persister $(CACHE_SERVICE) $(MAIL_CATCHER_SERVICE) webapi client
	
stop: docker-compose.yml ## Stop
	$(call logFun,Stopping FARO containers...)
	@$(COMPOSE) stop

restart: stop start ## Restart

start-admins: docker-compose.yml ## Start administration ui
	$(call logFun,Starting admins...)
	@$(COMPOSE) up --build -d db-admin db-image-persister-admin

stop-admins:  ## Stop administration ui
	$(call logFun,Stopping admins...)
	@$(COMPOSE) stop db-admin db-image-persister-admin

gen-client-proxy: docker-compose.yml ## Generate client proxy (from swagger)
	@printf $(LBLUE)"Client proxy generation from swagger file: "$(NOCOLOR)$(YELLOW)"$(SWAGGER_URI)"$(GREEN)"...\n"
	@cd $(ROOT)FARO.webclient/src/actions; \
	curl -k $(SWAGGER_URI) -o FARO.json && \
	$(COMPOSE) run --rm -w /workspace/FARO.webclient/src/actions proxygen -l ts -s FARO.json -o faro_api_proxy.ts && rm FARO.json
	@printf $(NOCOLOR)

clear-outputs: ## Force delete all outputs
	$(call logFun,Clearing .Net outputs...)
	@find . -type d \( -iname "bin" -o -iname "obj" \) -print0 | xargs -0 rm -rf
	$(call logFun,Clearing Node outputs...)
	@rm -rf $(ROOT)FARO.webclient/node_modules

kill: ## Kill and down docker containers
	@$(COMPOSE) kill
	@$(COMPOSE) down --volumes --remove-orphans

ls: docker-compose.yml ## List running containers
	@$(COMPOSE) ps --filter "status=running"

.PHONY: init build dev start stop restart start-admins stop-admins gen-client-proxy clear-outputs kill ls

##
## The Batch
##
bargs:=--help
faro: docker-compose.yml ## Start faro. Pass "bargs" for batch arguments (default --help)
	$(call logSun,....)
	@$(COMPOSE) up --build -d db db-image-persister $(CACHE_SERVICE) $(MAIL_CATCHER_SERVICE) 2>/dev/null
	@$(COMPOSE) run --rm batch $(bargs)

.PHONY: faro

##
## Server API
##

api-start: ## Start api
	@$(COMPOSE) up --build -d webapi

api-stop: ## Stop server api container
	@$(COMPOSE) stop webapi

api-restart: api-stop api-start ## Restart api container

api-sh: ## Start new shell in api container
	@$(DOTNET_WEBAPI_EXEC) /bin/bash

api-log: ## Server api log
	@$(COMPOSE) logs -f --tail 30 webapi

.PHONY: api-start api-stop api-restart api-sh api-log

## 
## Client
##

client-deps: ## Install dependencies
	@$(YARN_RUN) yarn --cwd FARO.webclient --frozen-lockfile

client-shell: ## Start a bash shell on the client container
	@$(COMPOSE) run --rm client bash

client-start: ## Start client container
	@$(COMPOSE) up --build -d client 

client-stop: ## Stop client container
	@$(COMPOSE) stop client

client-restart: client-stop client-start ## Restart client container

client-log: ## Client log
	@$(COMPOSE) logs -f --tail 30 client

client-yarn-shell: ## Start a bash shell on the yarn container (use it for deps update)
	@$(YARN_RUN) /bin/bash

.PHONY: client-deps client-shell client-start client-stop client-restart client-log client-yarn-shell

##
## Database
##

db-start: ## Start dev database
	@$(COMPOSE) up -d db

db-stop: ## Stop dev database
	@$(COMPOSE) stop db

db-remove: db-stop
	@$(COMPOSE) rm -f db
	@docker volume rm -f faro_definition_data 

db-reset: | db-remove db-start ## Reset dev database

db-log: ## Database log
	@$(COMPOSE) logs -f --tail 30 db 

.PHONY: db-start db-stop db-remove db-reset db-log

##
## Cache service
##

cache-srv-start: ## Start cache service
	@$(COMPOSE) up -d $(CACHE_SERVICE)

cache-srv-stop: ## Stop cache service
	@$(COMPOSE) stop $(CACHE_SERVICE)

cache-srv-remove: cache-srv-stop
	@$(COMPOSE) rm -f $(CACHE_SERVICE)
	@docker volume rm -f faro_cache_data

cache-srv-reset: | cache-srv-remove cache-srv-start ## Reset cache service

cache-srv-shell: cache-srv-start ## Start a bash shell on cache service	
ifeq ($(strip $(CACHE_SERVICE_SHELL_STARTUP)),)
	@$(COMPOSE) run --rm $(CACHE_SERVICE) bash
else
	@$(COMPOSE) run --rm $(CACHE_SERVICE) bash -c $(CACHE_SERVICE_SHELL_STARTUP)
endif

cache-srv-log: ## Cache service log
	@$(COMPOSE) logs -f --tail 30 $(CACHE_SERVICE) 

.PHONY: cache-srv-start cache-srv-stop cache-srv-reset cache-srv-shell cache-srv-log

##
## Image Persister Database
##

db-image-persister-start: ## Start dev image persister database
	@$(COMPOSE) up -d db-image-persister

db-image-persister-stop: ## Stop dev image persister database
	@$(COMPOSE) stop db-image-persister

db-image-persister-remove: db-image-persister-stop
	@$(COMPOSE) rm -f db-image-persister
	@docker volume rm -f faro_image_persister_data

db-image-persister-reset: | db-image-persister-remove db-image-persister-start ## Reset dev image persister database

db-image-persister-log: ## Database image persister log
	@$(COMPOSE) logs -f --tail 30 db-image-persister 

.PHONY: db-image-persister-start db-image-persister-stop db-image-persister-remove db-image-persister-reset db-image-persister db-image-persister-log 

##
## Mail catcher service
##

mail-catcher-start: ## Start mail catcher service
	@$(COMPOSE) up -d $(MAIL_CATCHER_SERVICE)

mail-catcher-stop: ## Stop mail catcher service
	@$(COMPOSE) stop $(MAIL_CATCHER_SERVICE)

.PHONY: mail-catcher-start mail-catcher-stop

##
## Tests
##

test-client: ## Run client tests
	$(call logInfo,Testing client...)
	@$(COMPOSE) build -q client-test && $(COMPOSE) run --rm client-test $(YARN_CLI) test:ci

test-core: start-test-db-mongo ## Run core tests
	$(call logNotice,Testing core...)
	@$(COMPOSE) build -q core-test && $(COMPOSE) run --rm core-test $(DOTNET_CLI) test 

test-addons: ## Run addons tests
	$(call logNotice,Testing addons...)
	@$(COMPOSE) build -q addons-test && $(COMPOSE) run --rm addons-test $(DOTNET_CLI) test _test

targs=
test-core-vscode-dbg: start-test-db-mongo ## Debug vscode core tests. Pass "targs" as classname.methodname.
	$(call logFun,Testing core with vscode debugging (use process id in debug task)...)
	$(DOCKER) kill faro-core-test-vscode-dbg || true 2> /dev/null
	$(COMPOSE) build -q core-test && $(COMPOSE) run --rm --name faro-core-test-vscode-dbg --detach --entrypoint 'tail -f /dev/null' core-test
	$(DOCKER) exec -it -e VSTEST_HOST_DEBUG=1 faro-core-test-vscode-dbg $(DOTNET_CLI) test --filter "FullyQualifiedName=FARO.Test.$(targs)" -l "console;verbosity=detailed"

tsuite=
test-addons-vscode-dbg: ## Debug vscode addons tests. Pass "tsuite" as suite name (common,http) and pass "targs" as (classname without FARO.Addons.).methodname.
	$(call logFun,Testing addons with vscode debugging (use process id in debug task)...)
	@$(DOCKER) kill faro-addons-test-vscode-dbg || true 2> /dev/null
	@$(COMPOSE) build -q addons-test && $(COMPOSE) run --rm --name faro-addons-test-vscode-dbg --detach --entrypoint 'tail -f /dev/null' addons-test
	@$(DOCKER) exec -it -e VSTEST_HOST_DEBUG=1 faro-addons-test-vscode-dbg $(DOTNET_CLI) test _test/$(tsuite).test --filter "FullyQualifiedName=FARO.Addons.$(targs)" -l "console;verbosity=detailed"


start-test-db-mongo: ## Start mongo test container
	$(call logInfo,Starting mongo db test...)
	@${COMPOSE} up -d db-test

remove-test-db-mongo: ## Remove mongo test container
	$(call logInfo,Removing mongo db test...)
	@${COMPOSE} stop db-test && ${COMPOSE} rm -f db-test

.PHONY: test-client test-core test-core-vscode-dbg test-addons-vscode-dbg start-test-db-mongo remove-test-db-mongo

##
## Snapshot
##

hydrate: db-start ## Restore snapshot	
	@$(DOTNET_WEBAPI_RUN) ./.tools/hydrate.sh data
	@FARO_DB_HOST=$(FARO_DB_HOST) ./.tools/hydrate.sh db

freeze: db-start ## Create snapshot
	@$(DOTNET_WEBAPI_RUN) ./.tools/freeze.sh data
	@FARO_DB_HOST=$(FARO_DB_HOST) ./.tools/freeze.sh db

.PHONY: hydrate freeze
