.DEFAULT_GOAL := help

ROOT:=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Args
DEVTOOLKIT_SCRIPT_SOURCE=https://raw.githubusercontent.com/vgmr/dev-toolkit/master/sync-toolkit/bin/dt-sync-toolkit
FARO_SERVER=localhost:5073
FARO_DATA_PATH?=/faro_data
FARO_DB_HOST?=faro-db-dev
SWAGGER_URI=http://$(FARO_SERVER)/swagger/v1/swagger.json
PLUGGABLES=datalayer.mongodb imagepersister.mysql addons
BATCH_PLUGGABLES=$(PLUGGABLES) niceflowrunner
CACHE_SERVICE=cache-redis
CACHE_SERVICE_SHELL_STARTUP="redis-cli -h faro-$(CACHE_SERVICE)"
MAIL_CATCHER_SERVICE=mailcatcher

# Tools
DOCKER=docker
DOCKER_COMPOSE=docker-compose
DOTNET_CLI=dotnet
COMPOSE=$(DOCKER_COMPOSE) -p faro -f $(ROOT)docker-compose.yml
YARN=$(COMPOSE) run --rm yarn
WEBAPI_EXEC=$(DOCKER) exec -it -e FARO_DATA_PATH=$(FARO_DATA_PATH) faro-webapi
WEBAPI_DOTNET=$(WEBAPI_EXEC) $(DOTNET_CLI)
BATCH_DOTNET=$(WEBAPI_EXEC) $(DOTNET_CLI)

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

docker-composer.yml: docker-compose.yml.def
	@if [ ! -f "./docker-compose.yml" ]; then \
		cp docker-compose.yml.def docker-compose.yml; \
	fi;

init: ## Initialize development tools
	$(call logInfo,Installing dev-toolkit (create-api-client)...)
	@curl -o- $(DEVTOOLKIT_SCRIPT_SOURCE) | TOOL=create-api-client bash

build: docker-compose.yml ## Build images
	$(COMPOSE) pull --parallel --quiet --ignore-pull-failures 2> /dev/null
	@$(COMPOSE) build --pull

start: docker-composer.yml ## Start app
	$(call logSun,Starting app...)
	@$(COMPOSE) up --build --quiet-pull -d db db-image-persister $(CACHE_SERVICE) $(MAIL_CATCHER_SERVICE) webapi client
	
stop: docker-composer.yml ## Stop app
	$(call logFun,Stopping FARO containers...)
	@$(COMPOSE) stop

restart: stop start ## Restart app

start-admins: docker-composer.yml ## Start administration ui (db, db-image-persister)
	$(call logNotice,Starting admins...)
	@$(COMPOSE) up --build -d db-admin db-image-persister-admin

gen-client-proxy: ## Generate client proxy (from swagger)
	@printf $(LBLUE)"Client proxy generation from swagger file: "$(NOCOLOR)$(YELLOW)"$(SWAGGER_URI)"$(GREEN)"...\n"
	@cd $(ROOT)FARO.webclient/src/actions; \
	curl -k $(SWAGGER_URI) -o FARO.json && \
	$(COMPOSE) run --rm -w /workspace/FARO.webclient/src/actions proxygen -l ts -s FARO.json -o faro_api_proxy.ts && rm FARO.json
	@printf $(NOCOLOR)

kill: ## Kill and down docker containers
	@$(COMPOSE) kill
	@$(COMPOSE) down --volumes --remove-orphans

ls:  ## List running containers
	@$(COMPOSE) ps --filter "status=running"

.PHONY: init build start stop restart start-admins gen-client-proxy kill ls

##
## The Batch
##
bargs:=--help
batch-start: docker-compose.yml ## Start batch
	$(call logNotice,FARO...)
	@$(COMPOSE) up --build --quiet-pull -d db db-image-persister $(CACHE_SERVICE) $(MAIL_CATCHER_SERVICE)
	@$(COMPOSE) run -i --rm batch dotnet run -- $(bargs)

batch-plugs-restore: ## Restore api pluggables services
	@for plug in $(BATCH_PLUGGABLES); do $(BATCH_DOTNET) restore FARO.$$plug --no-cache ; done

batch-plugs-publish: ## Publish all pluggables services
	@for plug in $(BATCH_PLUGGABLES); do $(BATCH_DOTNET) publish FARO.$$plug --no-cache ; done

.PHONY: batch-start batch-plugs-restore batch-plugs-publish

##
## Server API
##

api-start: ## Start api
	@$(COMPOSE) up --build -d webapi

api-stop: ## Stop server api container
	@$(COMPOSE) stop webapi

api-restart: api-stop api-start ## Restart api container

api-plugs-restore: ## Restore api pluggables services
	@for plug in $(PLUGGABLES); do $(WEBAPI_DOTNET) restore FARO.$$plug --no-cache ; done

api-plugs-publish: api-restart ## Publish all pluggables services
	@for plug in $(PLUGGABLES); do $(WEBAPI_DOTNET) publish FARO.$$plug --no-cache ; done

api-sh: ## Start new shell in api container
	@$(WEBAPI_EXEC) /bin/bash

api-log: ## Server api log
	@$(COMPOSE) logs -f --tail 20 webapi

.PHONY: api-start api-stop api-restart api-plugs-restore api-plugs-publish api-sh api-log

## 
## Client
##

client-clean: ## Clean client, install dependencies
	@$(YARN) yarn --cwd FARO.webclient --frozen-lockfile

client-shell: ## Start a bash shell on the client container
	@$(COMPOSE) run --rm client bash

client-start: ## Start client container
	@$(COMPOSE) up --build -d client 

client-stop: ## Stop client container
	@$(COMPOSE) stop client

client-restart: client-stop client-start ## Restart client container

client-log: ## Client log
	@$(COMPOSE) logs -f --tail 20 client

client-yarn-shell: ## Start a bash shell on the yarn container (use it for deps update)
	@$(YARN) /bin/bash

.PHONY: client-clean client-shell client-start client-stop client-restart client-log client-yarn-shell

##
## Database
##

db-start: ## Start dev database
	@$(COMPOSE) up -d db

db-stop: ## Stop dev database
	@$(COMPOSE) stop db

db-remove: db-stop
	@$(COMPOSE) rm -f db
	@docker volume rm -f faro_mongo_data 

db-reset: | db-remove db-start ## Reset dev database

db-log: ## Database log
	@$(COMPOSE) logs -f --tail 20 db 

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
	@docker volume rm -f "faro_cache_service_data"

cache-srv-reset: | cache-srv-remove cache-srv-start ## Reset cache service

cache-srv-shell: cache-srv-start ## Start a bash shell on cache service	
ifeq ($(strip $(CACHE_SERVICE_SHELL_STARTUP)),)
	@$(COMPOSE) run --rm $(CACHE_SERVICE) bash
else
	@$(COMPOSE) run --rm $(CACHE_SERVICE) bash -c $(CACHE_SERVICE_SHELL_STARTUP)
endif

cache-srv-log: ## Cache service log
	@$(COMPOSE) logs -f --tail 20 $(CACHE_SERVICE) 

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
	@$(COMPOSE) logs -f --tail 20 db-image-persister 

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
	@$(COMPOSE) build client-test && $(COMPOSE) run --rm client-test yarn test:ci

test-api: ## Run api tests
	$(call logNotice,Testing api...)
	@$(COMPOSE) build -q api-test && $(COMPOSE) run --rm api-test dotnet test

.PHONY: test-client test-api

##
## Snapshot
##

hydrate: ## Restore snapshot	
	@$(WEBAPI_EXEC) ./.tools/hydrate.sh data
	@FARO_DB_HOST=$(FARO_DB_HOST) ./.tools/hydrate.sh db

freeze: ## Create snapshot
	@$(WEBAPI_EXEC) ./.tools/freeze.sh data
	@FARO_DB_HOST=$(FARO_DB_HOST) ./.tools/freeze.sh db

.PHONY: hydrate freeze